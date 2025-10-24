import React, { useState } from 'react';
import { Plus, Check, X, Target, Calendar, Flame, TrendingUp, Award, BarChart3, Eye, EyeOff, Settings } from 'lucide-react';

const HabitTracker = ({ habits, setHabits }) => {
  const [newHabit, setNewHabit] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('health');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, calendar
  const [showStats, setShowStats] = useState(true);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [showHabitDetails, setShowHabitDetails] = useState(false);

  const addHabit = () => {
    if (newHabit.trim()) {
      const habit = {
        id: Date.now(),
        name: newHabit,
        category: selectedCategory,
        streak: 0,
        bestStreak: 0,
        lastChecked: null,
        checks: [],
        createdAt: new Date().toISOString(),
        target: 'daily', // daily, weekly
        color: getRandomColor()
      };
      setHabits(prev => [...prev, habit]);
      setNewHabit('');
    }
  };

  const getRandomColor = () => {
    const colors = ['purple', 'blue', 'green', 'yellow', 'pink', 'indigo', 'red', 'orange'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const toggleHabit = (id, date = new Date().toISOString().split('T')[0]) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === id) {
        const checks = [...habit.checks];
        const checkIndex = checks.findIndex(check => check.date === date);
        
        if (checkIndex >= 0) {
          checks.splice(checkIndex, 1);
        } else {
          checks.push({ date, completed: true, timestamp: new Date().toISOString() });
        }
        
        // Calculate current streak
        const today = new Date();
        let streak = 0;
        for (let i = 0; i < 365; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - i);
          const dateStr = checkDate.toISOString().split('T')[0];
          
          if (checks.some(check => check.date === dateStr)) {
            streak++;
          } else {
            break;
          }
        }

        // Calculate best streak
        let bestStreak = Math.max(habit.bestStreak, streak);
        let currentStreak = 0;
        let maxStreak = 0;
        
        // Sort checks by date
        const sortedChecks = checks.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        for (let i = 0; i < sortedChecks.length; i++) {
          if (i === 0) {
            currentStreak = 1;
          } else {
            const prevDate = new Date(sortedChecks[i - 1].date);
            const currDate = new Date(sortedChecks[i].date);
            const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);
            
            if (diffDays === 1) {
              currentStreak++;
            } else {
              maxStreak = Math.max(maxStreak, currentStreak);
              currentStreak = 1;
            }
          }
        }
        bestStreak = Math.max(maxStreak, currentStreak, bestStreak);
        
        return {
          ...habit,
          checks,
          streak,
          bestStreak,
          lastChecked: checks.length > 0 ? Math.max(...checks.map(c => new Date(c.date))) : null
        };
      }
      return habit;
    }));
  };

  const deleteHabit = (id) => {
    setHabits(prev => prev.filter(habit => habit.id !== id));
  };

  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const isChecked = (habit, date) => {
    return habit.checks.some(check => check.date === date);
  };

  const getCompletionRate = (habit, days = 30) => {
    const last30Days = getLast30Days().slice(-days);
    const completedDays = last30Days.filter(date => isChecked(habit, date)).length;
    return Math.round((completedDays / days) * 100);
  };

  const getHabitStats = () => {
    const totalHabits = habits.length;
    const totalChecks = habits.reduce((sum, habit) => sum + habit.checks.length, 0);
    const avgStreak = totalHabits > 0 ? Math.round(habits.reduce((sum, habit) => sum + habit.streak, 0) / totalHabits) : 0;
    const bestOverallStreak = Math.max(...habits.map(h => h.bestStreak), 0);
    const todayCompleted = habits.filter(habit => isChecked(habit, new Date().toISOString().split('T')[0])).length;
    
    return { totalHabits, totalChecks, avgStreak, bestOverallStreak, todayCompleted };
  };

  const getColorClasses = (color, variant = 'bg') => {
    const colorMap = {
      purple: { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-400', bgLight: 'bg-purple-500/20' },
      blue: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-400', bgLight: 'bg-blue-500/20' },
      green: { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-400', bgLight: 'bg-green-500/20' },
      yellow: { bg: 'bg-yellow-500', border: 'border-yellow-500', text: 'text-yellow-400', bgLight: 'bg-yellow-500/20' },
      pink: { bg: 'bg-pink-500', border: 'border-pink-500', text: 'text-pink-400', bgLight: 'bg-pink-500/20' },
      indigo: { bg: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-400', bgLight: 'bg-indigo-500/20' },
      red: { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-400', bgLight: 'bg-red-500/20' },
      orange: { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-400', bgLight: 'bg-orange-500/20' }
    };
    return colorMap[color] || colorMap.purple;
  };

  const categories = [
    { id: 'health', name: 'Sağlık', icon: '💪', color: 'green' },
    { id: 'productivity', name: 'Verimlilik', icon: '⚡', color: 'blue' },
    { id: 'learning', name: 'Öğrenme', icon: '📚', color: 'purple' },
    { id: 'fitness', name: 'Fitness', icon: '🏃', color: 'orange' },
    { id: 'mindfulness', name: 'Farkındalık', icon: '🧘', color: 'indigo' },
    { id: 'social', name: 'Sosyal', icon: '👥', color: 'pink' },
    { id: 'creative', name: 'Yaratıcılık', icon: '🎨', color: 'yellow' },
    { id: 'other', name: 'Diğer', icon: '📝', color: 'gray' }
  ];

  const stats = getHabitStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Alışkanlık Takibi</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowStats(!showStats)}
            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-xl transition-all flex items-center gap-2"
          >
            {showStats ? <EyeOff size={20} /> : <Eye size={20} />}
            İstatistikler
          </button>
          <button 
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-xl transition-all flex items-center gap-2"
          >
            <BarChart3 size={20} />
            {viewMode === 'grid' ? 'Liste' : 'Izgara'}
          </button>
        </div>
      </div>

      {/* İstatistikler */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-xl border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-purple-400" size={20} />
              <span className="text-gray-100 font-medium">Toplam</span>
            </div>
            <div className="text-3xl font-bold text-purple-400">{stats.totalHabits}</div>
            <div className="text-gray-400 text-sm">alışkanlık</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Check className="text-green-400" size={20} />
              <span className="text-gray-100 font-medium">Bugün</span>
            </div>
            <div className="text-3xl font-bold text-green-400">{stats.todayCompleted}</div>
            <div className="text-gray-400 text-sm">tamamlandı</div>
          </div>

          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-4 rounded-xl border border-orange-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="text-orange-400" size={20} />
              <span className="text-gray-100 font-medium">Ortalama</span>
            </div>
            <div className="text-3xl font-bold text-orange-400">{stats.avgStreak}</div>
            <div className="text-gray-400 text-sm">streak</div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 rounded-xl border border-yellow-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Award className="text-yellow-400" size={20} />
              <span className="text-gray-100 font-medium">En İyi</span>
            </div>
            <div className="text-3xl font-bold text-yellow-400">{stats.bestOverallStreak}</div>
            <div className="text-gray-400 text-sm">streak</div>
          </div>

          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 rounded-xl border border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-blue-400" size={20} />
              <span className="text-gray-100 font-medium">Toplam</span>
            </div>
            <div className="text-3xl font-bold text-blue-400">{stats.totalChecks}</div>
            <div className="text-gray-400 text-sm">tamamlama</div>
          </div>
        </div>
      )}
      
      {/* Yeni Alışkanlık Ekleme */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
        <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-gray-100">
          <Plus className="text-purple-400" />
          Yeni Alışkanlık Ekle
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="Alışkanlık adı"
            className="md:col-span-2 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            onKeyPress={(e) => e.key === 'Enter' && addHabit()}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={addHabit} 
          className="mt-3 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all w-full md:w-auto"
        >
          Alışkanlık Ekle
        </button>
      </div>

      {/* Alışkanlık Listesi */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
        {habits.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-xl mb-2">Henüz alışkanlık eklenmemiş</p>
            <p className="text-sm">Yukarıdan yeni bir alışkanlık ekleyerek başlayın</p>
          </div>
        ) : (
          habits.map(habit => {
            const completionRate = getCompletionRate(habit, 7);
            const category = categories.find(c => c.id === habit.category) || categories[0];
            const colorClasses = getColorClasses(habit.color);
            
            return (
              <div key={habit.id} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl hover:border-purple-500/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colorClasses.bg}`}></div>
                    <div>
                      <h3 className="font-semibold text-xl text-gray-100">{habit.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-orange-400">
                        <Flame size={16} />
                        <span className="font-bold text-lg">{habit.streak}</span>
                      </div>
                      <div className="text-xs text-gray-400">güncel</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Award size={16} />
                        <span className="font-bold text-lg">{habit.bestStreak}</span>
                      </div>
                      <div className="text-xs text-gray-400">en iyi</div>
                    </div>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Haftalık Görünüm */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Son 7 Gün</span>
                    <span className="text-sm font-medium text-gray-300">{completionRate}% tamamlandı</span>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {getLast7Days().map(date => {
                      const checked = isChecked(habit, date);
                      const dayName = new Date(date).toLocaleDateString('tr-TR', { weekday: 'short' });
                      const dayNumber = new Date(date).getDate();
                      const isToday = date === new Date().toISOString().split('T')[0];
                      
                      return (
                        <div key={date} className="text-center">
                          <div className="text-xs text-gray-400 mb-1">{dayName}</div>
                          <button
                            onClick={() => toggleHabit(habit.id, date)}
                            className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all text-sm font-medium ${
                              checked 
                                ? `${colorClasses.bg} ${colorClasses.border} text-white shadow-lg` 
                                : isToday
                                ? `border-gray-400 hover:${colorClasses.border} text-gray-300 ring-2 ring-gray-400/30`
                                : `border-gray-600 hover:${colorClasses.border} text-gray-400`
                            }`}
                          >
                            {checked ? <Check size={16} /> : dayNumber}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Aylık Heatmap */}
                <div>
                  <div className="text-sm text-gray-400 mb-2">Son 30 Gün</div>
                  <div className="grid grid-cols-10 gap-1">
                    {getLast30Days().map(date => {
                      const checked = isChecked(habit, date);
                      return (
                        <div
                          key={date}
                          className={`w-3 h-3 rounded-sm transition-all ${
                            checked ? colorClasses.bgLight : 'bg-gray-700'
                          }`}
                          title={`${date}: ${checked ? 'Tamamlandı' : 'Tamamlanmadı'}`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* İlerleme Çubuğu */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Bu hafta ilerleme</span>
                    <span>{completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${colorClasses.bg}`}
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HabitTracker;