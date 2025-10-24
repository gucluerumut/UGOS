import React, { useState } from 'react';
import { Clock, Check, BookOpen, Dumbbell, Target, TrendingUp, Upload, Download, Calendar, BarChart3, Activity, Brain, Trophy, DollarSign, Lightbulb, AlertTriangle, Bell, Heart, Zap, Star, UploadCloud, DownloadCloud } from 'lucide-react';
import WeatherWidget from './WeatherWidget';
import useMotivationalQuotes from '../hooks/useMotivationalQuotes';

const Dashboard = ({ 
  focusEntries,
  tasks, 
  learningEntries, 
  workouts, 
  habits, 
  goals,
  transactions,
  meditationData,
  sleepData,
  bookData,
  exportData, 
  importData,
  exportDataByDate,
  exportDataByRange,
  onCloudBackup,
  onCloudRestoreLatest
}) => {
  const [exportDate, setExportDate] = useState(new Date().toISOString().split('T')[0]);
  const defaultEnd = new Date();
  const defaultStart = new Date();
  defaultStart.setDate(defaultEnd.getDate() - 7);
  const [exportRangeStart, setExportRangeStart] = useState(defaultStart.toISOString().split('T')[0]);
  const [exportRangeEnd, setExportRangeEnd] = useState(defaultEnd.toISOString().split('T')[0]);
  const getTotalFocusMinutes = () => (focusEntries || []).reduce((sum, entry) => sum + parseInt(entry.minutes || 0), 0);
  const getTotalLearningMinutes = () => (learningEntries || []).reduce((sum, entry) => sum + parseInt(entry.minutes || 0), 0);
  const getCompletedTasksCount = () => (tasks || []).filter(t => t.completed).length;
  const getTotalWorkouts = () => (workouts || []).length;
  const getActiveGoalsCount = () => (goals || []).filter(g => !g.completed).length;
  const getCompletedGoalsCount = () => (goals || []).filter(g => g.completed).length;
  const getTotalIncome = () => (transactions || []).filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const getTotalExpenses = () => (transactions || []).filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  
  // Yeni bileşenler için istatistikler
  const getTotalMeditationMinutes = () => (meditationData || []).reduce((sum, session) => sum + parseInt(session.duration || 0), 0);
  const getMeditationStreak = () => {
    if (!meditationData || meditationData.length === 0) return 0;
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasSession = meditationData.some(session => session.date === dateStr);
      if (hasSession) streak++;
      else if (i > 0) break;
    }
    return streak;
  };
  
  const getAverageSleepHours = () => {
    if (!sleepData || sleepData.length === 0) return 0;
    const totalMinutes = sleepData.reduce((sum, entry) => {
      if (!entry.bedTime || !entry.wakeTime) return sum;
      const bedTime = new Date(`2000-01-01T${entry.bedTime}`);
      const wakeTime = new Date(`2000-01-01T${entry.wakeTime}`);
      if (wakeTime < bedTime) wakeTime.setDate(wakeTime.getDate() + 1);
      return sum + (wakeTime - bedTime) / (1000 * 60);
    }, 0);
    return Math.round((totalMinutes / sleepData.length / 60) * 10) / 10;
  };
  
  const getCompletedBooksCount = () => (bookData || []).filter(book => book.status === 'completed').length;
  const getCurrentlyReadingCount = () => (bookData || []).filter(book => book.status === 'reading').length;
  const getTotalPagesRead = () => (bookData || []).reduce((sum, book) => sum + (book.currentPage || 0), 0);

  // Deadline Takibi Fonksiyonları
  const getUpcomingDeadlines = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const taskDeadlines = (tasks || [])
      .filter(task => !task.completed && task.dueDate)
      .map(task => ({
        id: task.id,
        title: task.text,
        type: 'task',
        dueDate: task.dueDate,
        priority: task.priority,
        category: task.category,
        daysLeft: Math.ceil((new Date(task.dueDate) - today) / (1000 * 60 * 60 * 24))
      }));

    const goalDeadlines = (goals || [])
      .filter(goal => !goal.completed && goal.deadline)
      .map(goal => ({
        id: goal.id,
        title: goal.title,
        type: 'goal',
        dueDate: goal.deadline,
        priority: goal.priority,
        category: goal.category,
        daysLeft: Math.ceil((new Date(goal.deadline) - today) / (1000 * 60 * 60 * 24))
      }));

    const milestoneDeadlines = (goals || [])
      .filter(goal => !goal.completed && goal.milestones)
      .flatMap(goal => 
        goal.milestones
          .filter(milestone => !milestone.completed && milestone.deadline)
          .map(milestone => ({
            id: `${goal.id}-${milestone.id}`,
            title: `${goal.title} - ${milestone.title}`,
            type: 'milestone',
            dueDate: milestone.deadline,
            priority: goal.priority,
            category: goal.category,
            daysLeft: Math.ceil((new Date(milestone.deadline) - today) / (1000 * 60 * 60 * 24))
          }))
      );

    return [...taskDeadlines, ...goalDeadlines, ...milestoneDeadlines]
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 10);
  };

  const getOverdueItems = () => {
    const today = new Date();
    
    const overdueTasks = (tasks || [])
      .filter(task => !task.completed && task.dueDate && new Date(task.dueDate) < today)
      .map(task => ({
        id: task.id,
        title: task.text,
        type: 'task',
        dueDate: task.dueDate,
        priority: task.priority,
        category: task.category,
        daysOverdue: Math.ceil((today - new Date(task.dueDate)) / (1000 * 60 * 60 * 24))
      }));

    const overdueGoals = (goals || [])
      .filter(goal => !goal.completed && goal.deadline && new Date(goal.deadline) < today)
      .map(goal => ({
        id: goal.id,
        title: goal.title,
        type: 'goal',
        dueDate: goal.deadline,
        priority: goal.priority,
        category: goal.category,
        daysOverdue: Math.ceil((today - new Date(goal.deadline)) / (1000 * 60 * 60 * 24))
      }));

    return [...overdueTasks, ...overdueGoals]
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  };

  const getDeadlineStats = () => {
    const upcomingDeadlines = getUpcomingDeadlines();
    const overdueItems = getOverdueItems();
    
    const dueTodayCount = upcomingDeadlines.filter(item => item.daysLeft === 0).length;
    const dueThisWeekCount = upcomingDeadlines.filter(item => item.daysLeft <= 7 && item.daysLeft > 0).length;
    const overdueCount = overdueItems.length;
    
    return {
      dueToday: dueTodayCount,
      dueThisWeek: dueThisWeekCount,
      overdue: overdueCount,
      upcoming: upcomingDeadlines.length
    };
   };

  // Motivasyon Sözleri Hook'u
  const { getDailyQuote, getRandomQuote, getQuotesByCategory } = useMotivationalQuotes();
  
  // Kategori bazlı icon mapping
  const getCategoryIcon = (category) => {
    const iconMap = {
      'success': '🌟',
      'goals': '🎯',
      'change': '💪',
      'preparation': '⚡',
      'self-improvement': '📚',
      'progress': '📈',
      'habits': '🔄',
      'persistence': '🌱',
      'dreams': '✨',
      'resilience': '🦾',
      'motivation': '🔥',
      'leadership': '👑',
      'creativity': '🎨',
      'wisdom': '🦉',
      'courage': '🦁',
      'focus': '🎯',
      'discipline': '⚖️',
      'learning': '📖',
      'innovation': '💡',
      'teamwork': '🤝',
      'time': '⏰',
      'opportunity': '🚪',
      'mindset': '🧠',
      'action': '🚀',
      'excellence': '💎'
    };
    return iconMap[category] || '💫';
  };

  const getHabitStreaks = () => {
    return habits.map(habit => {
      const streak = getHabitStreak(habit);
      const today = new Date().toISOString().split('T')[0];
      const checkedToday = habit.checks && habit.checks[today];
      
      return {
        id: habit.id,
        name: habit.name,
        streak: streak,
        checkedToday: checkedToday,
        category: habit.category,
        icon: habit.icon || '🎯'
      };
    }).sort((a, b) => b.streak - a.streak);
  };

  const getMotivationalStats = () => {
    const totalTasks = (tasks || []).length;
    const completedTasks = getCompletedTasksCount();
    const totalGoals = (goals || []).length;
    const completedGoals = getCompletedGoalsCount();
    const totalHabits = habits.length;
    const activeStreaks = habits.filter(h => getHabitStreak(h) > 0).length;
    
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    
    let motivationLevel = 'Başlangıç';
    let motivationColor = 'blue';
    let motivationIcon = '🌱';
    
    if (completionRate >= 80 && goalCompletionRate >= 60 && activeStreaks >= 3) {
      motivationLevel = 'Efsane';
      motivationColor = 'purple';
      motivationIcon = '🏆';
    } else if (completionRate >= 60 && goalCompletionRate >= 40 && activeStreaks >= 2) {
      motivationLevel = 'Harika';
      motivationColor = 'green';
      motivationIcon = '🌟';
    } else if (completionRate >= 40 && goalCompletionRate >= 20 && activeStreaks >= 1) {
      motivationLevel = 'İyi';
      motivationColor = 'yellow';
      motivationIcon = '⚡';
    }
    
    return {
      level: motivationLevel,
      color: motivationColor,
      icon: motivationIcon,
      completionRate,
      goalCompletionRate,
      activeStreaks,
      totalStreakDays: habits.reduce((sum, h) => sum + getHabitStreak(h), 0)
    };
  };

  const getHabitStreak = (habit) => {
    if (!habit.checks) return 0;
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (habit.checks[dateStr]) streak++;
      else break;
    }
    return streak;
  };

  const getWeeklyStats = () => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyFocus = (focusEntries || [])
      .filter(entry => new Date(entry.date) >= weekAgo)
      .reduce((sum, entry) => sum + parseInt(entry.minutes || 0), 0);
    
    const weeklyLearning = (learningEntries || [])
      .filter(entry => new Date(entry.date) >= weekAgo)
      .reduce((sum, entry) => sum + parseInt(entry.minutes || 0), 0);
    
    const weeklyWorkouts = (workouts || [])
      .filter(workout => new Date(workout.date) >= weekAgo).length;

    const weeklyGoals = (goals || [])
      .filter(goal => new Date(goal.createdAt) >= weekAgo).length;
    
    return { weeklyFocus, weeklyLearning, weeklyWorkouts, weeklyGoals };
  };

  const getTasksByCategory = () => {
    const categories = ['daily', 'weekly', 'monthly', 'quarterly'];
    return categories.map(cat => ({
      category: cat,
      total: (tasks || []).filter(t => t.category === cat).length,
      completed: (tasks || []).filter(t => t.category === cat && t.completed).length
    }));
  };

  const getTopLearningPlatforms = () => {
    const platformStats = {};
    (learningEntries || []).forEach(entry => {
      if (entry.platform) {
        platformStats[entry.platform] = (platformStats[entry.platform] || 0) + parseInt(entry.minutes || 0);
      }
    });
    return Object.entries(platformStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
  };

  const getProductivityScore = () => {
    const totalTasks = (tasks || []).length;
    const completedTasks = getCompletedTasksCount();
    const focusHours = getTotalFocusMinutes() / 60;
    const learningHours = getTotalLearningMinutes() / 60;
    
    let score = 0;
    if (totalTasks > 0) score += (completedTasks / totalTasks) * 30;
    score += Math.min(focusHours * 2, 30);
    score += Math.min(learningHours * 2, 20);
    score += Math.min((workouts || []).length * 2, 20);
    
    return Math.round(score) || 0;
  };

  const getPersonalAnalytics = () => {
    const dayStats = {};
    const hourStats = {};
    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    
    // Günlük analiz
    [...(focusEntries || []), ...(learningEntries || [])].forEach(entry => {
      if (entry.date) {
        const date = new Date(entry.date);
        const dayOfWeek = date.getDay();
        const dayName = dayNames[dayOfWeek];
        
        if (!dayStats[dayName]) {
          dayStats[dayName] = { focus: 0, learning: 0, total: 0 };
        }
        
        if (entry.minutes) {
          const minutes = parseInt(entry.minutes);
          if (focusEntries && focusEntries.includes(entry)) {
            dayStats[dayName].focus += minutes;
          } else {
            dayStats[dayName].learning += minutes;
          }
          dayStats[dayName].total += minutes;
        }
      }
    });

    // Saatlik analiz (focus entries'den saat bilgisi varsa)
    (focusEntries || []).forEach(entry => {
      if (entry.startTime) {
        const hour = parseInt(entry.startTime.split(':')[0]);
        if (!hourStats[hour]) {
          hourStats[hour] = 0;
        }
        hourStats[hour] += parseInt(entry.minutes || 0);
      }
    });

    // En verimli gün
    const mostProductiveDay = Object.entries(dayStats)
      .sort(([,a], [,b]) => b.total - a.total)[0];

    // En verimli saat
    const mostProductiveHour = Object.entries(hourStats)
      .sort(([,a], [,b]) => b - a)[0];

    // Hafta içi vs hafta sonu
    const weekdayTotal = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma']
      .reduce((sum, day) => sum + (dayStats[day]?.total || 0), 0);
    const weekendTotal = ['Cumartesi', 'Pazar']
      .reduce((sum, day) => sum + (dayStats[day]?.total || 0), 0);

    return {
      dayStats,
      hourStats,
      mostProductiveDay,
      mostProductiveHour,
      weekdayTotal,
      weekendTotal,
      weekdayAverage: weekdayTotal / 5,
      weekendAverage: weekendTotal / 2
    };
  };

  // Otomatik Hedef Önerileri
  const getSmartGoalSuggestions = () => {
    const suggestions = [];
    
    // Focus verilerine dayalı öneriler
    if (focusEntries.length > 0) {
      const avgDailyFocus = focusEntries.reduce((sum, entry) => sum + entry.minutes, 0) / focusEntries.length;
      
      if (avgDailyFocus < 60) {
        suggestions.push({
          id: 'increase-focus',
          title: 'Günlük Odaklanma Süresini Artır',
          description: `Mevcut ortalama: ${Math.round(avgDailyFocus)} dk. Hedef: 90 dk`,
          category: 'personal',
          period: 'daily',
          targetValue: '90',
          unit: 'dakika',
          priority: 'high',
          reason: 'Düşük odaklanma süresi tespit edildi',
          icon: '🎯',
          color: 'blue'
        });
      }
      
      if (avgDailyFocus > 120) {
        suggestions.push({
          id: 'maintain-focus',
          title: 'Odaklanma Başarısını Sürdür',
          description: `Harika! Ortalama ${Math.round(avgDailyFocus)} dk odaklanıyorsunuz`,
          category: 'personal',
          period: 'weekly',
          targetValue: '7',
          unit: 'gün',
          priority: 'medium',
          reason: 'Yüksek odaklanma performansı',
          icon: '⭐',
          color: 'green'
        });
      }
    }
    
    // Learning verilerine dayalı öneriler
    if (learningEntries.length > 0) {
      const avgDailyLearning = learningEntries.reduce((sum, entry) => sum + entry.minutes, 0) / learningEntries.length;
      const uniquePlatforms = [...new Set(learningEntries.map(entry => entry.platform))];
      
      if (avgDailyLearning < 30) {
        suggestions.push({
          id: 'increase-learning',
          title: 'Günlük Öğrenme Süresini Artır',
          description: `Mevcut ortalama: ${Math.round(avgDailyLearning)} dk. Hedef: 45 dk`,
          category: 'education',
          period: 'daily',
          targetValue: '45',
          unit: 'dakika',
          priority: 'high',
          reason: 'Düşük öğrenme süresi tespit edildi',
          icon: '📚',
          color: 'purple'
        });
      }
      
      if (uniquePlatforms.length < 3) {
        suggestions.push({
          id: 'diversify-learning',
          title: 'Öğrenme Kaynaklarını Çeşitlendir',
          description: `Şu an ${uniquePlatforms.length} platform kullanıyorsunuz. Hedef: 3 platform`,
          category: 'education',
          period: 'monthly',
          targetValue: '3',
          unit: 'platform',
          priority: 'medium',
          reason: 'Sınırlı öğrenme kaynağı kullanımı',
          icon: '🌟',
          color: 'indigo'
        });
      }
    }
    
    // Workout verilerine dayalı öneriler
    if (workouts.length > 0) {
      const weeklyWorkouts = workouts.filter(entry => {
        const entryDate = new Date(entry.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate >= weekAgo;
      }).length;
      
      if (weeklyWorkouts < 3) {
        suggestions.push({
          id: 'increase-workout',
          title: 'Haftalık Antrenman Sayısını Artır',
          description: `Bu hafta ${weeklyWorkouts} antrenman yaptınız. Hedef: 4 antrenman`,
          category: 'health',
          period: 'weekly',
          targetValue: '4',
          unit: 'antrenman',
          priority: 'high',
          reason: 'Düşük antrenman sıklığı',
          icon: '💪',
          color: 'red'
        });
      }
    } else {
      suggestions.push({
        id: 'start-workout',
        title: 'Düzenli Egzersiz Rutini Başlat',
        description: 'Sağlıklı yaşam için haftada 3 kez egzersiz yapın',
        category: 'health',
        period: 'weekly',
        targetValue: '3',
        unit: 'antrenman',
        priority: 'high',
        reason: 'Hiç antrenman kaydı bulunamadı',
        icon: '🏃‍♂️',
        color: 'orange'
      });
    }
    
    // Hedef verilerine dayalı öneriler
    if (goals && goals.length > 0) {
      const completedGoals = goals.filter(g => g.status === 'completed').length;
      const completionRate = (completedGoals / goals.length) * 100;
      
      if (completionRate < 50) {
        suggestions.push({
          id: 'improve-goal-completion',
          title: 'Hedef Tamamlama Oranını Artır',
          description: `Mevcut başarı oranı: %${Math.round(completionRate)}. Hedef: %75`,
          category: 'personal',
          period: 'monthly',
          targetValue: '75',
          unit: '%',
          priority: 'high',
          reason: 'Düşük hedef tamamlama oranı',
          icon: '🎯',
          color: 'yellow'
        });
      }
      
      const dailyGoals = goals.filter(g => g.period === 'daily').length;
      if (dailyGoals === 0) {
        suggestions.push({
          id: 'add-daily-goals',
          title: 'Günlük Hedefler Belirle',
          description: 'Günlük rutinler oluşturmak için küçük hedefler ekleyin',
          category: 'personal',
          period: 'daily',
          targetValue: '2',
          unit: 'hedef',
          priority: 'medium',
          reason: 'Günlük hedef eksikliği',
          icon: '📅',
          color: 'cyan'
        });
      }
    } else {
      suggestions.push({
        id: 'set-first-goals',
        title: 'İlk Hedeflerinizi Belirleyin',
        description: 'Kişisel gelişim için SMART hedefler oluşturun',
        category: 'personal',
        period: 'weekly',
        targetValue: '3',
        unit: 'hedef',
        priority: 'high',
        reason: 'Hiç hedef bulunamadı',
        icon: '🚀',
        color: 'emerald'
      });
    }
    
    // Habit verilerine dayalı öneriler
    if (habits.length === 0) {
      suggestions.push({
        id: 'create-habits',
        title: 'Günlük Alışkanlıklar Oluştur',
        description: 'Başarı için tutarlı günlük rutinler geliştirin',
        category: 'personal',
        period: 'daily',
        targetValue: '3',
        unit: 'alışkanlık',
        priority: 'medium',
        reason: 'Hiç alışkanlık bulunamadı',
        icon: '🔄',
        color: 'teal'
      });
    }
    
    return suggestions.slice(0, 6); // En fazla 6 öneri göster
  };

  const { weeklyFocus, weeklyLearning, weeklyWorkouts, weeklyGoals } = getWeeklyStats();
  const tasksByCategory = getTasksByCategory();
  const topPlatforms = getTopLearningPlatforms();
  const productivityScore = getProductivityScore();
  const personalAnalytics = getPersonalAnalytics();
  const smartSuggestions = getSmartGoalSuggestions();
  const upcomingDeadlines = getUpcomingDeadlines();
  const overdueItems = getOverdueItems();
  const deadlineStats = getDeadlineStats();

  // Motivasyon Mesajları Verileri
  const motivationalQuote = getDailyQuote();
  const habitStreaks = getHabitStreaks();
  const motivationalStats = getMotivationalStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Dashboard
        </h2>
        <div className="flex gap-3 items-center">
          <label className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all shadow-lg flex items-center gap-2">
            <Upload size={20} />
            Import
            <input type="file" accept=".json" onChange={importData} className="hidden" />
          </label>
          <button 
            onClick={exportData} 
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2"
          >
            <Download size={20} />
            Export
          </button>
          {onCloudBackup && (
            <button 
              onClick={onCloudBackup} 
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2"
            >
              <UploadCloud size={20} />
              Buluta Yedekle
            </button>
          )}
          {onCloudRestoreLatest && (
            <button 
              onClick={onCloudRestoreLatest} 
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2"
            >
              <DownloadCloud size={20} />
              Buluttan Son Yedeği Yükle
            </button>
          )}
          <div className="flex items-center gap-2 bg-gray-800/60 border border-gray-700 rounded-xl p-2">
            <input 
              type="date" 
              value={exportDate} 
              onChange={(e) => setExportDate(e.target.value)} 
              className="bg-gray-700 text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={() => exportDataByDate && exportDataByDate(exportDate)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              title="Seçilen tarihe göre export"
            >
              <Download size={18} />
              Tarihli Export
            </button>
          </div>
          <div className="flex items-center gap-2 bg-gray-800/60 border border-gray-700 rounded-xl p-2">
            <input 
              type="date" 
              value={exportRangeStart} 
              onChange={(e) => setExportRangeStart(e.target.value)} 
              className="bg-gray-700 text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-gray-400">→</span>
            <input 
              type="date" 
              value={exportRangeEnd} 
              onChange={(e) => setExportRangeEnd(e.target.value)} 
              className="bg-gray-700 text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button 
              onClick={() => {
                if (!exportRangeStart || !exportRangeEnd) {
                  alert('Başlangıç ve bitiş tarihlerini seçin');
                  return;
                }
                if (new Date(exportRangeStart) > new Date(exportRangeEnd)) {
                  alert('Başlangıç tarihi, bitiş tarihinden büyük olamaz');
                  return;
                }
                exportDataByRange && exportDataByRange(exportRangeStart, exportRangeEnd);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              title="Seçilen tarih aralığına göre export"
            >
              <Download size={18} />
              Aralıklı Export
            </button>
          </div>
        </div>
      </div>

      {/* Motivasyon ve Başarı Sistemi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disiplin Seviyesi */}
        <div className={`bg-gradient-to-r from-${motivationalStats.color}-600 via-${motivationalStats.color}-700 to-${motivationalStats.color}-800 p-6 rounded-2xl shadow-xl border border-${motivationalStats.color}-500/30`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-xl mb-2 flex items-center gap-2">
                <Trophy className="text-white" size={24} />
                Disiplin Seviyesi
              </h3>
              <p className="text-white/80">Mevcut performans durumunuz</p>
            </div>
            <div className="text-6xl">{motivationalStats.icon}</div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{motivationalStats.level}</div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{motivationalStats.completionRate}%</div>
              <div className="text-white/70 text-xs">Görev Tamamlama</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{motivationalStats.goalCompletionRate}%</div>
              <div className="text-white/70 text-xs">Hedef Başarısı</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{motivationalStats.activeStreaks}</div>
              <div className="text-white/70 text-xs">Aktif Seri</div>
            </div>
          </div>
        </div>

        {/* Günün Motivasyon Mesajı */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-2xl shadow-xl border border-emerald-500/30">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{getCategoryIcon(motivationalQuote.category)}</div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
                <Zap className="text-white" size={20} />
                Günün Sözü
              </h3>
              <blockquote className="text-white/90 text-lg italic leading-relaxed mb-3">
                "{motivationalQuote.text}"
              </blockquote>
              <div className="text-emerald-200 text-sm">— {motivationalQuote.author}</div>
            </div>
          </div>
        </div>

        {/* Hava Durumu Widget */}
        <WeatherWidget />
      </div>

      {/* Productivity Score */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 rounded-2xl shadow-xl border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-xl mb-2 flex items-center gap-2">
              <Brain className="text-white" size={24} />
              Verimlilik Skoru
            </h3>
            <p className="text-white/80">Genel performansınız</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-white mb-1">{productivityScore}</div>
            <div className="text-white/80 text-sm">/ 100</div>
          </div>
        </div>
        <div className="mt-4 bg-white/20 rounded-full h-3">
          <div 
            className="bg-white rounded-full h-3 transition-all duration-500" 
            style={{ width: `${productivityScore}%` }}
          ></div>
        </div>
      </div>
      
      {/* Ana İstatistikler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl shadow-xl border border-blue-500/30 card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-400/20 p-3 rounded-xl">
              <Clock className="text-blue-200" size={24} />
            </div>
            <h3 className="font-semibold text-blue-100">Focus Time</h3>
          </div>
          <p className="text-4xl font-bold text-white">{getTotalFocusMinutes()}</p>
          <p className="text-blue-200 text-sm mt-1">dakika toplam</p>
          <div className="mt-2 text-blue-300 text-sm">
            Bu hafta: {weeklyFocus} dk
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-2xl shadow-xl border border-emerald-500/30 card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-emerald-400/20 p-3 rounded-xl">
              <Check className="text-emerald-200" size={24} />
            </div>
            <h3 className="font-semibold text-emerald-100">Görevler</h3>
          </div>
          <p className="text-4xl font-bold text-white">{getCompletedTasksCount()}/{tasks.length}</p>
          <p className="text-emerald-200 text-sm mt-1">tamamlandı</p>
          <div className="mt-2 text-emerald-300 text-sm">
            %{tasks.length > 0 ? Math.round((getCompletedTasksCount() / tasks.length) * 100) : 0} başarı
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-2xl shadow-xl border border-purple-500/30 card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-400/20 p-3 rounded-xl">
              <BookOpen className="text-purple-200" size={24} />
            </div>
            <h3 className="font-semibold text-purple-100">Öğrenme</h3>
          </div>
          <p className="text-4xl font-bold text-white">{getTotalLearningMinutes()}</p>
          <p className="text-purple-200 text-sm mt-1">dakika toplam</p>
          <div className="mt-2 text-purple-300 text-sm">
            Bu hafta: {weeklyLearning} dk
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-6 rounded-2xl shadow-xl border border-orange-500/30 card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-orange-400/20 p-3 rounded-xl">
              <Dumbbell className="text-orange-200" size={24} />
            </div>
            <h3 className="font-semibold text-orange-100">Antrenman</h3>
          </div>
          <p className="text-4xl font-bold text-white">{getTotalWorkouts()}</p>
          <p className="text-orange-200 text-sm mt-1">aktivite toplam</p>
          <div className="mt-2 text-orange-300 text-sm">
            Bu hafta: {weeklyWorkouts} antrenman
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 p-6 rounded-2xl shadow-xl border border-yellow-500/30 card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-yellow-400/20 p-3 rounded-xl">
              <Trophy className="text-yellow-200" size={24} />
            </div>
            <h3 className="font-semibold text-yellow-100">Hedefler</h3>
          </div>
          <p className="text-4xl font-bold text-white">{getCompletedGoalsCount()}/{(goals || []).length}</p>
          <p className="text-yellow-200 text-sm mt-1">tamamlandı</p>
          <div className="mt-2 text-yellow-300 text-sm">
            Aktif: {getActiveGoalsCount()} hedef
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-2xl shadow-xl border border-green-500/30 card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-400/20 p-3 rounded-xl">
              <DollarSign className="text-green-200" size={24} />
            </div>
            <h3 className="font-semibold text-green-100">Finans</h3>
          </div>
          <p className="text-4xl font-bold text-white">₺{(getTotalIncome() - getTotalExpenses()).toLocaleString()}</p>
          <p className="text-green-200 text-sm mt-1">net bakiye</p>
          <div className="mt-2 text-green-300 text-sm">
            Gelir: ₺{getTotalIncome().toLocaleString()}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-2xl shadow-xl border border-indigo-500/30 card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-indigo-400/20 p-3 rounded-xl">
              <Brain className="text-indigo-200" size={24} />
            </div>
            <h3 className="font-semibold text-indigo-100">Meditasyon</h3>
          </div>
          <p className="text-4xl font-bold text-white">{getTotalMeditationMinutes()}</p>
          <p className="text-indigo-200 text-sm mt-1">dakika toplam</p>
          <div className="mt-2 text-indigo-300 text-sm">
            Seri: {getMeditationStreak()} gün
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-600 to-slate-800 p-6 rounded-2xl shadow-xl border border-slate-500/30 card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-slate-400/20 p-3 rounded-xl">
              <Heart className="text-slate-200" size={24} />
            </div>
            <h3 className="font-semibold text-slate-100">Uyku</h3>
          </div>
          <p className="text-4xl font-bold text-white">{getAverageSleepHours()}</p>
          <p className="text-slate-200 text-sm mt-1">saat ortalama</p>
          <div className="mt-2 text-slate-300 text-sm">
            {(sleepData || []).length} kayıt
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-600 to-amber-800 p-6 rounded-2xl shadow-xl border border-amber-500/30 card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-amber-400/20 p-3 rounded-xl">
              <BookOpen className="text-amber-200" size={24} />
            </div>
            <h3 className="font-semibold text-amber-100">Kitaplar</h3>
          </div>
          <p className="text-4xl font-bold text-white">{getCompletedBooksCount()}</p>
          <p className="text-amber-200 text-sm mt-1">tamamlandı</p>
          <div className="mt-2 text-amber-300 text-sm">
            Okuyor: {getCurrentlyReadingCount()}
          </div>
        </div>
      </div>

      {/* Deadline Takibi */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
        <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-gray-100">
          <Bell className="text-red-400" />
          Deadline Takibi
        </h3>
        
        {/* Deadline İstatistikleri */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-500/20 p-4 rounded-xl border border-red-500/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-red-400" size={20} />
              <span className="text-red-300 font-medium">Geciken</span>
            </div>
            <div className="text-3xl font-bold text-red-400">{deadlineStats.overdue}</div>
            <div className="text-red-300 text-sm">öğe</div>
          </div>
          
          <div className="bg-orange-500/20 p-4 rounded-xl border border-orange-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-orange-400" size={20} />
              <span className="text-orange-300 font-medium">Bugün</span>
            </div>
            <div className="text-3xl font-bold text-orange-400">{deadlineStats.dueToday}</div>
            <div className="text-orange-300 text-sm">son tarih</div>
          </div>
          
          <div className="bg-yellow-500/20 p-4 rounded-xl border border-yellow-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-yellow-400" size={20} />
              <span className="text-yellow-300 font-medium">Bu Hafta</span>
            </div>
            <div className="text-3xl font-bold text-yellow-400">{deadlineStats.dueThisWeek}</div>
            <div className="text-yellow-300 text-sm">son tarih</div>
          </div>
          
          <div className="bg-blue-500/20 p-4 rounded-xl border border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-blue-400" size={20} />
              <span className="text-blue-300 font-medium">Yaklaşan</span>
            </div>
            <div className="text-3xl font-bold text-blue-400">{deadlineStats.upcoming}</div>
            <div className="text-blue-300 text-sm">toplam</div>
          </div>
        </div>

        {/* Yaklaşan Deadline'lar */}
        {upcomingDeadlines.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-lg mb-3 text-gray-200">Yaklaşan Deadline'lar</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {upcomingDeadlines.map((item) => {
                const getUrgencyColor = (daysLeft) => {
                  if (daysLeft < 0) return 'border-red-500/50 bg-red-500/10';
                  if (daysLeft === 0) return 'border-orange-500/50 bg-orange-500/10';
                  if (daysLeft <= 3) return 'border-yellow-500/50 bg-yellow-500/10';
                  return 'border-blue-500/50 bg-blue-500/10';
                };

                const getTypeIcon = (type) => {
                  switch (type) {
                    case 'task': return '📋';
                    case 'goal': return '🎯';
                    case 'milestone': return '🏁';
                    default: return '📌';
                  }
                };

                const getUrgencyText = (daysLeft) => {
                  if (daysLeft < 0) return `${Math.abs(daysLeft)} gün gecikti`;
                  if (daysLeft === 0) return 'Bugün';
                  if (daysLeft === 1) return 'Yarın';
                  return `${daysLeft} gün kaldı`;
                };

                return (
                  <div key={item.id} className={`p-4 rounded-xl border ${getUrgencyColor(item.daysLeft)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getTypeIcon(item.type)}</span>
                        <div>
                          <div className="font-medium text-gray-200">{item.title}</div>
                          <div className="text-sm text-gray-400 capitalize">
                            {item.type === 'task' ? 'Görev' : item.type === 'goal' ? 'Hedef' : 'Milestone'} • {item.category}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${item.daysLeft <= 0 ? 'text-red-400' : item.daysLeft <= 3 ? 'text-yellow-400' : 'text-blue-400'}`}>
                          {getUrgencyText(item.daysLeft)}
                        </div>
                        <div className="text-sm text-gray-400">{item.dueDate}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Geciken Öğeler */}
        {overdueItems.length > 0 && (
          <div>
            <h4 className="font-medium text-lg mb-3 text-red-300">Geciken Öğeler</h4>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {overdueItems.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-red-500/50 bg-red-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <div className="font-medium text-red-200">{item.title}</div>
                        <div className="text-sm text-red-300 capitalize">
                          {item.type === 'task' ? 'Görev' : 'Hedef'} • {item.category}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-red-400">
                        {item.daysOverdue} gün gecikti
                      </div>
                      <div className="text-sm text-red-300">{item.dueDate}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcomingDeadlines.length === 0 && overdueItems.length === 0 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-xl font-medium text-gray-300 mb-2">Harika!</div>
            <div className="text-gray-400">Yaklaşan deadline'ınız yok</div>
          </div>
        )}
      </div>

      {/* Görev Kategorileri */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
        <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-gray-100">
          <BarChart3 className="text-emerald-400" />
          Görev Kategorileri
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tasksByCategory.map(({ category, total, completed }) => {
            const labels = { daily: 'Günlük', weekly: 'Haftalık', monthly: 'Aylık', quarterly: '3 Aylık' };
            const percentage = total > 0 ? (completed / total) * 100 : 0;
            return (
              <div key={category} className="bg-gray-700/30 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-100 font-medium">{labels[category]}</span>
                  <span className="text-emerald-400 font-bold">{completed}/{total}</span>
                </div>
                <div className="bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 rounded-full h-2 transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-gray-400 text-sm mt-1">%{Math.round(percentage)} tamamlandı</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* En Çok Kullanılan Platformlar */}
      {topPlatforms.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
          <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-gray-100">
            <BookOpen className="text-purple-400" />
            En Çok Kullanılan Öğrenme Platformları
          </h3>
          <div className="space-y-3">
            {topPlatforms.map(([platform, minutes], index) => (
              <div key={platform} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                  <span className="text-gray-100 font-medium">{platform}</span>
                </div>
                <div className="text-right">
                  <div className="text-purple-400 font-bold">{minutes} dk</div>
                  <div className="text-gray-400 text-sm">{Math.round(minutes / 60 * 10) / 10} saat</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aktif Alışkanlıklar */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
        <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-gray-100">
          <Target className="text-pink-400" />
          Aktif Alışkanlıklar
        </h3>
        {habits.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">🎯</div>
            <p>Henüz alışkanlık eklenmemiş</p>
            <p className="text-sm mt-1">Alışkanlıklar sekmesinden yeni alışkanlık ekleyebilirsiniz</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {habits.map(habit => (
              <div key={habit.id} className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-4 rounded-xl border border-pink-500/30 hover:border-pink-400/50 transition-all">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-100">{habit.name}</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-pink-400" size={16} />
                    <span className="text-pink-400 font-bold text-lg">{getHabitStreak(habit.id)}</span>
                    <span className="text-gray-400 text-sm">gün</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kişisel İstatistikler - En Verimli Günler ve Saatler */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
        <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-gray-100">
          <Activity className="text-cyan-400" />
          Kişisel İstatistikler
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* En Verimli Günler */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-200 text-lg">📅 Günlük Verimlilik Analizi</h4>
            <div className="space-y-3">
              {Object.entries(personalAnalytics.dayStats).map(([day, stats]) => {
                const maxTotal = Math.max(...Object.values(personalAnalytics.dayStats).map(s => s.total));
                const percentage = maxTotal > 0 ? (stats.total / maxTotal) * 100 : 0;
                return (
                  <div key={day} className="bg-gray-700/30 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-100 font-medium">{day}</span>
                      <span className="text-cyan-400 font-bold">{stats.total} dk</span>
                    </div>
                    <div className="bg-gray-600 rounded-full h-2 mb-1">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full h-2 transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Odaklanma: {stats.focus} dk</span>
                      <span>Öğrenme: {stats.learning} dk</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* En Verimli Gün */}
            {personalAnalytics.mostProductiveDay && (
              <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 rounded-xl border border-cyan-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🏆</span>
                  <span className="text-cyan-300 font-semibold">En Verimli Gün</span>
                </div>
                <div className="text-white font-bold text-lg">{personalAnalytics.mostProductiveDay[0]}</div>
                <div className="text-cyan-200 text-sm">{personalAnalytics.mostProductiveDay[1].total} dakika toplam aktivite</div>
              </div>
            )}
          </div>

          {/* Hafta İçi vs Hafta Sonu & Saatlik Analiz */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-200 text-lg">⏰ Zaman Analizi</h4>
            
            {/* Hafta İçi vs Hafta Sonu */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {Math.round(personalAnalytics.weekdayAverage)}
                </div>
                <div className="text-blue-300 text-sm">Hafta İçi Ortalama (dk)</div>
                <div className="text-blue-200 text-xs mt-1">
                  Toplam: {personalAnalytics.weekdayTotal} dk
                </div>
              </div>
              <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20 text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {Math.round(personalAnalytics.weekendAverage)}
                </div>
                <div className="text-purple-300 text-sm">Hafta Sonu Ortalama (dk)</div>
                <div className="text-purple-200 text-xs mt-1">
                  Toplam: {personalAnalytics.weekendTotal} dk
                </div>
              </div>
            </div>

            {/* En Verimli Saat */}
            {personalAnalytics.mostProductiveHour && (
              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-4 rounded-xl border border-orange-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🕐</span>
                  <span className="text-orange-300 font-semibold">En Verimli Saat</span>
                </div>
                <div className="text-white font-bold text-lg">
                  {personalAnalytics.mostProductiveHour[0]}:00 - {parseInt(personalAnalytics.mostProductiveHour[0]) + 1}:00
                </div>
                <div className="text-orange-200 text-sm">{personalAnalytics.mostProductiveHour[1]} dakika odaklanma</div>
              </div>
            )}

            {/* Saatlik Dağılım */}
            {Object.keys(personalAnalytics.hourStats).length > 0 && (
              <div className="bg-gray-700/30 p-4 rounded-xl">
                <h5 className="text-gray-200 font-medium mb-3">Saatlik Aktivite Dağılımı</h5>
                <div className="grid grid-cols-6 gap-1">
                  {Array.from({length: 24}, (_, i) => {
                    const hour = i;
                    const minutes = personalAnalytics.hourStats[hour] || 0;
                    const maxHourMinutes = Math.max(...Object.values(personalAnalytics.hourStats));
                    const intensity = maxHourMinutes > 0 ? (minutes / maxHourMinutes) : 0;
                    return (
                      <div 
                        key={hour}
                        className="h-8 rounded text-xs flex items-center justify-center text-white font-medium transition-all hover:scale-110"
                        style={{
                          backgroundColor: `rgba(34, 197, 94, ${intensity * 0.8 + 0.1})`,
                          border: intensity > 0 ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(75, 85, 99, 0.3)'
                        }}
                        title={`${hour}:00 - ${minutes} dakika`}
                      >
                        {hour}
                      </div>
                    );
                  })}
                </div>
                <div className="text-xs text-gray-400 mt-2 text-center">
                  Koyu yeşil = Daha fazla aktivite
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Otomatik Hedef Önerileri */}
      {smartSuggestions.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
          <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-gray-100">
            <Lightbulb className="text-yellow-400" />
            Akıllı Hedef Önerileri
          </h3>
          <p className="text-gray-400 text-sm mb-6">Geçmiş verilerinize dayalı kişiselleştirilmiş öneriler</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {smartSuggestions.map(suggestion => (
              <div key={suggestion.id} className={`bg-gradient-to-br from-${suggestion.color}-500/10 to-${suggestion.color}-600/5 p-4 rounded-xl border border-${suggestion.color}-500/20 hover:border-${suggestion.color}-400/40 transition-all group`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl">{suggestion.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-100 text-sm mb-1 group-hover:text-white transition-colors">
                      {suggestion.title}
                    </h4>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs bg-${suggestion.color}-500/20 text-${suggestion.color}-400`}>
                      {suggestion.period === 'daily' ? 'Günlük' : 
                       suggestion.period === 'weekly' ? 'Haftalık' : 
                       suggestion.period === 'monthly' ? 'Aylık' : 'Yıllık'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      suggestion.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      suggestion.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {suggestion.priority === 'high' ? 'Yüksek' : 
                       suggestion.priority === 'medium' ? 'Orta' : 'Düşük'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-${suggestion.color}-400 font-bold text-sm`}>
                      {suggestion.targetValue} {suggestion.unit}
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">💡 Neden öneriliyor:</div>
                  <div className="text-xs text-gray-400">{suggestion.reason}</div>
                </div>
                
                <button 
                  onClick={() => {
                    // Hedef ekleme fonksiyonu - Goals sekmesine yönlendir
                    if (setActiveTab) {
                      setActiveTab('goals');
                    }
                  }}
                  className={`w-full bg-${suggestion.color}-600 hover:bg-${suggestion.color}-700 text-white py-2 px-3 rounded-lg text-xs font-medium transition-colors`}
                >
                  Hedef Olarak Ekle
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-blue-400">🤖</div>
              <h4 className="font-medium text-blue-300 text-sm">AI Destekli Analiz</h4>
            </div>
            <p className="text-blue-200 text-xs leading-relaxed">
              Bu öneriler, son 30 günlük aktivite verileriniz analiz edilerek oluşturulmuştur. 
              Öneriler günlük olarak güncellenir ve kişisel gelişiminizi desteklemek için optimize edilir.
            </p>
          </div>
        </div>
      )}

      {/* Motivasyon Mesajları */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
        <h3 className="font-semibold text-xl mb-6 flex items-center gap-2 text-gray-100">
          <Heart className="text-pink-400" />
          Motivasyon Merkezi
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Günün Motivasyon Mesajı */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 p-6 rounded-xl border border-pink-500/30">
              <div className="flex items-start gap-3 mb-4">
                <div className="text-3xl">{getCategoryIcon(motivationalQuote.category)}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-pink-300 text-sm mb-2">Günün Sözü</h4>
                  <blockquote className="text-gray-100 text-lg leading-relaxed italic mb-3">
                    "{motivationalQuote.text}"
                  </blockquote>
                  <cite className="text-pink-400 text-sm font-medium">— {motivationalQuote.author}</cite>
                </div>
              </div>
            </div>

            {/* Disiplin Seviyesi */}
            <div className={`bg-gradient-to-br from-${motivationalStats.color}-500/20 to-${motivationalStats.color}-600/20 p-4 rounded-xl border border-${motivationalStats.color}-500/30`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{motivationalStats.icon}</span>
                  <h4 className="font-semibold text-gray-100">Disiplin Seviyesi</h4>
                </div>
                <div className={`text-${motivationalStats.color}-400 font-bold text-lg`}>
                  {motivationalStats.level}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-700/30 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{motivationalStats.completionRate}%</div>
                  <div className="text-xs text-gray-400">Görev Başarısı</div>
                </div>
                <div className="bg-gray-700/30 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{motivationalStats.goalCompletionRate}%</div>
                  <div className="text-xs text-gray-400">Hedef Başarısı</div>
                </div>
                <div className="bg-gray-700/30 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">{motivationalStats.activeStreaks}</div>
                  <div className="text-xs text-gray-400">Aktif Seri</div>
                </div>
              </div>
            </div>
          </div>

          {/* Alışkanlık Serileri */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-200 text-lg flex items-center gap-2">
              <Zap className="text-yellow-400" />
              Alışkanlık Serileri
            </h4>
            
            {habitStreaks.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {habitStreaks.slice(0, 6).map(habit => (
                  <div key={habit.id} className="bg-gray-700/30 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{habit.icon}</span>
                        <span className="text-gray-100 font-medium">{habit.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {habit.checkedToday && (
                          <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                            ✓ Bugün
                          </div>
                        )}
                        <div className="text-right">
                          <div className="text-2xl font-bold text-yellow-400">{habit.streak}</div>
                          <div className="text-xs text-gray-400">gün seri</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Seri Göstergesi */}
                    <div className="flex items-center gap-1 mt-2">
                      {Array.from({length: Math.min(habit.streak, 10)}, (_, i) => (
                        <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      ))}
                      {habit.streak > 10 && (
                        <div className="text-yellow-400 text-xs ml-1">+{habit.streak - 10}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🌱</div>
                <div className="text-gray-300 font-medium mb-1">Henüz alışkanlık seriniz yok</div>
                <div className="text-gray-400 text-sm">Alışkanlıklarınızı takip etmeye başlayın!</div>
              </div>
            )}

            {/* Toplam Seri İstatistiği */}
            {motivationalStats.totalStreakDays > 0 && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 rounded-xl border border-yellow-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-400" size={20} />
                    <span className="text-gray-100 font-medium">Toplam Seri Günleri</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {motivationalStats.totalStreakDays}
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Tüm alışkanlıklarınızın toplam seri günü
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Haftalık Özet */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
        <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-gray-100">
          <Calendar className="text-cyan-400" />
          Bu Haftanın Özeti
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <div className="text-3xl font-bold text-blue-400 mb-1">{Math.round(weeklyFocus / 60 * 10) / 10}</div>
            <div className="text-blue-300 text-sm">saat odaklanma</div>
          </div>
          <div className="text-center p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <div className="text-3xl font-bold text-purple-400 mb-1">{Math.round(weeklyLearning / 60 * 10) / 10}</div>
            <div className="text-purple-300 text-sm">saat öğrenme</div>
          </div>
          <div className="text-center p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
            <div className="text-3xl font-bold text-orange-400 mb-1">{weeklyWorkouts}</div>
            <div className="text-orange-300 text-sm">antrenman seansı</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;