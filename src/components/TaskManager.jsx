import React, { useState } from 'react';
import { Plus, Check, X, Calendar, Target, Filter, Clock, AlertCircle, Star, Search, SortAsc, SortDesc, Brain, Zap, TrendingUp } from 'lucide-react';

const TaskManager = ({ tasks = [], setTasks }) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('personal');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [smartCategorySuggestion, setSmartCategorySuggestion] = useState(null);
  const [smartPrioritySuggestion, setSmartPrioritySuggestion] = useState(null);

  const addTask = () => {
    if (newTaskText.trim()) {
      const task = {
        id: Date.now(),
        text: newTaskText,
        completed: false,
        category: selectedCategory,
        priority: selectedPriority,
        dueDate: dueDate || null,
        createdAt: new Date().toISOString(),
        completedAt: null
      };
      setTasks(prev => [...prev, task]);
      setNewTaskText('');
      setDueDate('');
    }
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { 
        ...task, 
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null
      } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const getFilteredTasks = () => {
    let filtered = tasks || [];

    // Kategori filtresi
    if (filterCategory !== 'all') {
      filtered = filtered.filter(task => task.category === filterCategory);
    }

    // Öncelik filtresi
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    // Durum filtresi
    if (filterStatus !== 'all') {
      if (filterStatus === 'completed') {
        filtered = filtered.filter(task => task.completed);
      } else if (filterStatus === 'pending') {
        filtered = filtered.filter(task => !task.completed);
      } else if (filterStatus === 'overdue') {
        const today = new Date().toISOString().split('T')[0];
        filtered = filtered.filter(task => 
          !task.completed && task.dueDate && task.dueDate < today
        );
      }
    }

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sıralama
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'dueDate':
          aValue = a.dueDate || '9999-12-31';
          bValue = b.dueDate || '9999-12-31';
          break;
        case 'text':
          aValue = a.text.toLowerCase();
          bValue = b.text.toLowerCase();
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const getTasksByCategory = (category) => {
    return getFilteredTasks().filter(task => task.category === category);
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertCircle className="text-red-400" size={16} />;
      case 'medium': return <Star className="text-yellow-400" size={16} />;
      case 'low': return <Clock className="text-blue-400" size={16} />;
      default: return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500/30 bg-red-500/10';
      case 'medium': return 'border-yellow-500/30 bg-yellow-500/10';
      case 'low': return 'border-blue-500/30 bg-blue-500/10';
      default: return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const isOverdue = (task) => {
    if (!task.dueDate || task.completed) return false;
    const today = new Date().toISOString().split('T')[0];
    return task.dueDate < today;
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTaskStats = () => {
    const safeTasks = tasks || [];
    const total = safeTasks.length;
    const completed = safeTasks.filter(t => t.completed).length;
    const overdue = safeTasks.filter(t => isOverdue(t)).length;
    const today = new Date().toISOString().split('T')[0];
    const dueToday = safeTasks.filter(t => !t.completed && t.dueDate === today).length;
    
    return { total, completed, overdue, dueToday };
  };

  // AI Destekli Akıllı Planlama Fonksiyonları
  const getSmartTaskSuggestions = () => {
    const suggestions = [];
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay(); // 0 = Pazar, 1 = Pazartesi, ...
    const today = now.toISOString().split('T')[0];
    
    // Geçmiş görev tamamlama verilerini analiz et
    const safeTasks = tasks || [];
    const completedTasks = safeTasks.filter(t => t.completed);
    const tasksByHour = {};
    const tasksByDay = {};
    const tasksByCategory = {};
    
    completedTasks.forEach(task => {
      if (task.completedAt) {
        const completedDate = new Date(task.completedAt);
        const completedHour = completedDate.getHours();
        const completedDay = completedDate.getDay();
        
        tasksByHour[completedHour] = (tasksByHour[completedHour] || 0) + 1;
        tasksByDay[completedDay] = (tasksByDay[completedDay] || 0) + 1;
        tasksByCategory[task.category] = (tasksByCategory[task.category] || 0) + 1;
      }
    });
    
    // En verimli saat dilimini bul
    const mostProductiveHour = Object.entries(tasksByHour)
      .sort(([,a], [,b]) => b - a)[0];
    
    // En verimli günü bul
    const mostProductiveDay = Object.entries(tasksByDay)
      .sort(([,a], [,b]) => b - a)[0];
    
    // Bekleyen görevleri analiz et
    const pendingTasks = safeTasks.filter(t => !t.completed);
    const overdueTasks = pendingTasks.filter(t => isOverdue(t));
    const todayTasks = pendingTasks.filter(t => t.dueDate === today);
    
    // Öneriler oluştur
    if (overdueTasks.length > 0) {
      suggestions.push({
        type: 'urgent',
        title: 'Geciken Görevleri Önceliklendir',
        description: `${overdueTasks.length} geciken göreviniz var. Bunları öncelikli olarak tamamlayın.`,
        tasks: overdueTasks.slice(0, 3),
        icon: '🚨',
        color: 'red',
        priority: 'high'
      });
    }
    
    if (todayTasks.length > 0 && hour >= 9 && hour <= 18) {
      suggestions.push({
        type: 'today',
        title: 'Bugünün Görevleri',
        description: `Bugün tamamlanması gereken ${todayTasks.length} görev var.`,
        tasks: todayTasks.slice(0, 3),
        icon: '📅',
        color: 'blue',
        priority: 'high'
      });
    }
    
    // Verimli saat önerisi
    if (mostProductiveHour && hour < parseInt(mostProductiveHour[0])) {
      suggestions.push({
        type: 'timing',
        title: 'Optimal Çalışma Saati',
        description: `Geçmiş verilerinize göre saat ${mostProductiveHour[0]}:00'da daha verimlisiniz.`,
        icon: '⏰',
        color: 'green',
        priority: 'medium'
      });
    }
    
    // Kategori bazlı öneriler
    const highPriorityPending = pendingTasks.filter(t => t.priority === 'high');
    if (highPriorityPending.length > 0) {
      suggestions.push({
        type: 'priority',
        title: 'Yüksek Öncelikli Görevler',
        description: `${highPriorityPending.length} yüksek öncelikli göreviniz bekliyor.`,
        tasks: highPriorityPending.slice(0, 3),
        icon: '⭐',
        color: 'yellow',
        priority: 'medium'
      });
    }
    
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const getProductivityInsights = () => {
    const safeTasks = tasks || [];
    const completedTasks = safeTasks.filter(t => t.completed);
    const totalTasks = safeTasks.length;
    
    if (completedTasks.length === 0) {
      return {
        completionRate: 0,
        averageCompletionTime: 0,
        mostProductiveCategory: null,
        insights: ['Henüz tamamlanmış görev bulunmuyor.']
      };
    }
    
    const completionRate = Math.round((completedTasks.length / totalTasks) * 100);
    
    // Kategori bazlı analiz
    const categoryStats = {};
    completedTasks.forEach(task => {
      if (!categoryStats[task.category]) {
        categoryStats[task.category] = { completed: 0, total: 0 };
      }
      categoryStats[task.category].completed++;
    });
    
    safeTasks.forEach(task => {
      if (!categoryStats[task.category]) {
        categoryStats[task.category] = { completed: 0, total: 0 };
      }
      categoryStats[task.category].total++;
    });
    
    const mostProductiveCategory = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        rate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
        completed: stats.completed
      }))
      .sort((a, b) => b.rate - a.rate)[0];
    
    // İçgörüler oluştur
    const insights = [];
    
    if (completionRate >= 80) {
      insights.push('🎉 Harika! Görev tamamlama oranınız çok yüksek.');
    } else if (completionRate >= 60) {
      insights.push('👍 İyi gidiyorsunuz! Biraz daha odaklanarak %80\'e ulaşabilirsiniz.');
    } else if (completionRate >= 40) {
      insights.push('⚡ Görev tamamlama oranınızı artırmak için önceliklendirme yapın.');
    } else {
      insights.push('🎯 Daha küçük, ulaşılabilir görevlerle başlayın.');
    }
    
    if (mostProductiveCategory && mostProductiveCategory.rate > 70) {
      const categoryName = categories.find(c => c.id === mostProductiveCategory.category)?.name || mostProductiveCategory.category;
      insights.push(`🏆 ${categoryName} kategorisinde en başarılısınız (%${Math.round(mostProductiveCategory.rate)}).`);
    }
    
    const overdueTasks = safeTasks.filter(t => !t.completed && isOverdue(t));
    if (overdueTasks.length > 0) {
      insights.push(`⚠️ ${overdueTasks.length} geciken göreviniz var. Bunları öncelikli olarak ele alın.`);
    }
    
    return {
      completionRate,
      mostProductiveCategory,
      insights
    };
  };

  const getSmartCategorySuggestion = (taskText) => {
    const text = taskText.toLowerCase();
    
    // Anahtar kelime bazlı kategorizasyon
    const dailyKeywords = ['günlük', 'her gün', 'rutin', 'alışkanlık', 'sabah', 'akşam'];
    const weeklyKeywords = ['haftalık', 'hafta', 'haftada', 'pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma'];
    const monthlyKeywords = ['aylık', 'ay', 'ayda', 'ocak', 'şubat', 'mart', 'nisan', 'mayıs', 'haziran'];
    const quarterlyKeywords = ['çeyrek', 'üç ay', '3 ay', 'dönem', 'sezon'];
    
    if (dailyKeywords.some(keyword => text.includes(keyword))) {
      return 'daily';
    } else if (weeklyKeywords.some(keyword => text.includes(keyword))) {
      return 'weekly';
    } else if (monthlyKeywords.some(keyword => text.includes(keyword))) {
      return 'monthly';
    } else if (quarterlyKeywords.some(keyword => text.includes(keyword))) {
      return 'quarterly';
    }
    
    // Varsayılan olarak günlük
    return 'daily';
  };

  const getSmartPrioritySuggestion = (taskText) => {
    const text = taskText.toLowerCase();
    
    // Yüksek öncelik anahtar kelimeleri
    const highPriorityKeywords = ['acil', 'önemli', 'kritik', 'hemen', 'bugün', 'deadline', 'son tarih'];
    const lowPriorityKeywords = ['gelecek', 'sonra', 'boş zaman', 'isteğe bağlı', 'ekstra'];
    
    if (highPriorityKeywords.some(keyword => text.includes(keyword))) {
      return 'high';
    } else if (lowPriorityKeywords.some(keyword => text.includes(keyword))) {
      return 'low';
    }
    
    // Varsayılan olarak orta
    return 'medium';
  };

  const categories = [
    { id: 'personal', name: 'Kişisel', color: 'from-blue-500 to-blue-700', icon: '👤' },
    { id: 'work', name: 'İş', color: 'from-green-500 to-green-700', icon: '💼' },
    { id: 'health', name: 'Sağlık', color: 'from-red-500 to-red-700', icon: '❤️' },
    { id: 'learning', name: 'Öğrenme', color: 'from-purple-500 to-purple-700', icon: '📚' },
    { id: 'finance', name: 'Finans', color: 'from-yellow-500 to-yellow-700', icon: '💰' }
  ];

  const priorities = [
    { id: 'low', name: 'Düşük', color: 'text-blue-400' },
    { id: 'medium', name: 'Orta', color: 'text-yellow-400' },
    { id: 'high', name: 'Yüksek', color: 'text-red-400' },
    { id: 'urgent', name: 'Acil', color: 'text-red-600' }
  ];

  let stats, smartSuggestions, productivityInsights;
  try {
    stats = getTaskStats();
    smartSuggestions = getSmartTaskSuggestions();
    productivityInsights = getProductivityInsights();
  } catch (error) {
    console.error('TaskManager error:', error);
    stats = { total: 0, completed: 0, overdue: 0, dueToday: 0 };
    smartSuggestions = [];
    productivityInsights = { completionRate: 0, mostProductiveCategory: null, insights: [] };
  }

  // Akıllı kategori ve öncelik önerisi
  const handleTaskTextChange = (text) => {
    setNewTaskText(text);
    if (text.length > 5) {
      const suggestedCategory = getSmartCategorySuggestion(text);
      const suggestedPriority = getSmartPrioritySuggestion(text);
      setSmartCategorySuggestion(suggestedCategory);
      setSmartPrioritySuggestion(suggestedPriority);
      setSelectedCategory(suggestedCategory);
      setSelectedPriority(suggestedPriority);
    } else {
      setSmartCategorySuggestion(null);
      setSmartPrioritySuggestion(null);
    }
  };

  try {
    return (
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Görev Yönetimi</h2>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-xl transition-all flex items-center gap-2"
        >
          <Filter size={20} />
          Filtreler
        </button>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 rounded-xl border border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-blue-400" size={20} />
            <span className="text-gray-100 font-medium">Toplam</span>
          </div>
          <div className="text-3xl font-bold text-blue-400">{stats.total}</div>
          <div className="text-gray-400 text-sm">görev</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Check className="text-green-400" size={20} />
            <span className="text-gray-100 font-medium">Tamamlanan</span>
          </div>
          <div className="text-3xl font-bold text-green-400">{stats.completed}</div>
          <div className="text-gray-400 text-sm">%{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}</div>
        </div>

        <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 p-4 rounded-xl border border-red-500/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="text-red-400" size={20} />
            <span className="text-gray-100 font-medium">Geciken</span>
          </div>
          <div className="text-3xl font-bold text-red-400">{stats.overdue}</div>
          <div className="text-gray-400 text-sm">görev</div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 rounded-xl border border-yellow-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-yellow-400" size={20} />
            <span className="text-gray-100 font-medium">Bugün</span>
          </div>
          <div className="text-3xl font-bold text-yellow-400">{stats.dueToday}</div>
          <div className="text-gray-400 text-sm">bitiş tarihi</div>
        </div>
      </div>

      {/* Filtreler */}
      {showFilters && (
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
          <h3 className="font-semibold text-xl mb-4 text-gray-100">Filtreler ve Sıralama</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Arama</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Görev ara..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Kategori</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              >
                <option value="all">Tümü</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Öncelik</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              >
                <option value="all">Tümü</option>
                {priorities.map(priority => (
                  <option key={priority.id} value={priority.id}>{priority.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Durum</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              >
                <option value="all">Tümü</option>
                <option value="pending">Bekleyen</option>
                <option value="completed">Tamamlanan</option>
                <option value="overdue">Geciken</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Sıralama</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              >
                <option value="createdAt">Oluşturma Tarihi</option>
                <option value="dueDate">Bitiş Tarihi</option>
                <option value="priority">Öncelik</option>
                <option value="text">İsim</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Sıra</label>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white flex items-center justify-center gap-2"
              >
                {sortOrder === 'asc' ? <SortAsc size={20} /> : <SortDesc size={20} />}
                {sortOrder === 'asc' ? 'Artan' : 'Azalan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Destekli Akıllı Öneriler */}
      {smartSuggestions.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
          <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-gray-100">
            <Brain className="text-purple-400" />
            AI Destekli Akıllı Öneriler
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {smartSuggestions.map((suggestion, index) => (
              <div key={index} className={`bg-gradient-to-br from-${suggestion.color}-500/20 to-${suggestion.color}-600/20 p-4 rounded-xl border border-${suggestion.color}-500/30`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl">{suggestion.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-100 text-sm mb-1">
                      {suggestion.title}
                    </h4>
                    <p className="text-gray-300 text-xs mb-3">
                      {suggestion.description}
                    </p>
                    {suggestion.tasks && (
                      <div className="space-y-2">
                        {suggestion.tasks.map(task => (
                          <div key={task.id} className="bg-gray-700/30 p-2 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-100 text-xs">{task.text}</span>
                              <div className="flex items-center gap-1">
                                {task.priority === 'high' && <Star className="text-red-400" size={12} />}
                                {task.dueDate && isOverdue(task) && <AlertCircle className="text-red-400" size={12} />}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verimlilik İçgörüleri */}
      {productivityInsights.insights.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
          <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-gray-100">
            <TrendingUp className="text-cyan-400" />
            Verimlilik İçgörüleri
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 rounded-xl border border-cyan-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-100 font-medium">Tamamlama Oranı</span>
                  <span className="text-cyan-400 font-bold text-2xl">{productivityInsights.completionRate}%</span>
                </div>
                <div className="bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full h-2 transition-all duration-500" 
                    style={{ width: `${productivityInsights.completionRate}%` }}
                  ></div>
                </div>
              </div>
              
              {productivityInsights.mostProductiveCategory && (
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🏆</span>
                    <span className="text-gray-100 font-medium">En Başarılı Kategori</span>
                  </div>
                  <div className="text-green-400 font-bold">
                    {categories.find(c => c.id === productivityInsights.mostProductiveCategory.category)?.name}
                  </div>
                  <div className="text-green-300 text-sm">
                    %{Math.round(productivityInsights.mostProductiveCategory.rate)} başarı oranı
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-200 flex items-center gap-2">
                <Zap className="text-yellow-400" size={18} />
                Kişisel İçgörüler
              </h4>
              {productivityInsights.insights.map((insight, index) => (
                <div key={index} className="bg-gray-700/30 p-3 rounded-lg">
                  <p className="text-gray-100 text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Yeni Görev Ekleme */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
        <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-gray-100">
          <Plus className="text-green-400" />
          Yeni Görev Ekle
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => handleTaskTextChange(e.target.value)}
            placeholder="Görev açıklaması (AI otomatik kategori önerir)"
            className="lg:col-span-2 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none w-full"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {smartCategorySuggestion && (
              <div className="absolute -top-8 left-0 bg-purple-500/20 border border-purple-500/30 rounded-lg px-2 py-1 text-xs text-purple-300">
                AI Önerisi: {categories.find(c => c.id === smartCategorySuggestion)?.name}
              </div>
            )}
          </div>
          <div className="relative">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none w-full"
            >
              {priorities.map(priority => (
                <option key={priority.id} value={priority.id}>{priority.name}</option>
              ))}
            </select>
            {smartPrioritySuggestion && (
              <div className="absolute -top-8 left-0 bg-orange-500/20 border border-orange-500/30 rounded-lg px-2 py-1 text-xs text-orange-300">
                AI Önerisi: {priorities.find(p => p.id === smartPrioritySuggestion)?.name}
              </div>
            )}
          </div>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
          />
        </div>
        <button 
          onClick={addTask} 
          className="mt-3 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all w-full md:w-auto"
        >
          Görev Ekle
        </button>
      </div>

      {/* Görev Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(category => {
          const categoryTasks = getTasksByCategory(category.id);
          const completedCount = categoryTasks.filter(t => t.completed).length;
          
          return (
            <div key={category.id} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-xl text-gray-100 flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  {category.name}
                </h3>
                <span className="text-green-400 font-bold">
                  {completedCount}/{categoryTasks.length}
                </span>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {categoryTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-4xl mb-2">📝</div>
                    <p>Bu kategoride görev yok</p>
                    <p className="text-sm mt-1">Yukarıdan yeni görev ekleyebilirsiniz</p>
                  </div>
                ) : (
                  categoryTasks.map(task => {
                    const daysUntilDue = getDaysUntilDue(task.dueDate);
                    const overdue = isOverdue(task);
                    
                    return (
                      <div key={task.id} className={`p-3 rounded-lg transition-all border ${
                        task.completed ? 'bg-green-500/20 border-green-500/30' : 
                        overdue ? 'bg-red-500/20 border-red-500/30' :
                        getPriorityColor(task.priority)
                      }`}>
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-0.5 ${
                              task.completed ? 'bg-green-500 border-green-500' : 'border-gray-400 hover:border-green-400'
                            }`}
                          >
                            {task.completed && <Check size={16} className="text-white" />}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {getPriorityIcon(task.priority)}
                              <span className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-100'}`}>
                                {task.text}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                              {task.dueDate && (
                                <div className={`flex items-center gap-1 ${overdue ? 'text-red-400' : daysUntilDue <= 1 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                  <Calendar size={14} />
                                  {task.dueDate}
                                  {daysUntilDue !== null && (
                                    <span className="ml-1">
                                      ({daysUntilDue === 0 ? 'Bugün' : 
                                        daysUntilDue === 1 ? 'Yarın' :
                                        daysUntilDue > 0 ? `${daysUntilDue} gün` : 
                                        `${Math.abs(daysUntilDue)} gün geçti`})
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
    );
  } catch (error) {
    console.error('TaskManager render error:', error);
    return (
      <div className="space-y-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <h3 className="text-red-400 font-semibold mb-2">Görev Yönetimi Hatası</h3>
          <p className="text-red-300">Görev yönetimi yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.</p>
          <p className="text-red-300 text-sm mt-2">Hata: {error.message}</p>
        </div>
      </div>
    );
  }
};

export default TaskManager;