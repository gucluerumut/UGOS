import React, { useState, useMemo } from 'react';
import { Trash2, BookOpen, Clock, Target, TrendingUp, Award, Calendar, BarChart3, PieChart, Filter, Plus } from 'lucide-react';

const LearningTracker = ({ learningEntries, setLearningEntries, newLearning, setNewLearning }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const [learningGoal, setLearningGoal] = useState(localStorage.getItem('learningGoal') || '60');

  const handleAddLearning = () => {
    if (newLearning.topic) {
      const learningWithCategory = {
        ...newLearning,
        id: Date.now(),
        category: newLearning.category || 'Genel'
      };
      setLearningEntries([...learningEntries, learningWithCategory]);
      setNewLearning({ topic: '', platform: '', minutes: '', date: '', category: '' });
    }
  };

  const deleteLearningEntry = (entryId) => {
    setLearningEntries(learningEntries.filter(e => e.id !== entryId));
  };

  const handleGoalChange = (goal) => {
    setLearningGoal(goal);
    localStorage.setItem('learningGoal', goal);
  };

  // Filter entries based on selected filters
  const filteredEntries = useMemo(() => {
    let filtered = learningEntries;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(entry => entry.category === selectedCategory);
    }

    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(entry => entry.platform === selectedPlatform);
    }

    if (timeRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (timeRange) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(entry => new Date(entry.date) >= filterDate);
    }

    return filtered;
  }, [learningEntries, selectedCategory, selectedPlatform, timeRange]);

  const getTotalMinutes = (entries = learningEntries) => {
    return entries.reduce((sum, entry) => sum + parseInt(entry.minutes || 0), 0);
  };

  const getTopPlatforms = (entries = learningEntries) => {
    const platformCounts = {};
    entries.forEach(entry => {
      if (entry.platform) {
        platformCounts[entry.platform] = (platformCounts[entry.platform] || 0) + parseInt(entry.minutes || 0);
      }
    });
    return Object.entries(platformCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getCategoryStats = () => {
    const categoryStats = {};
    learningEntries.forEach(entry => {
      const category = entry.category || 'Genel';
      if (!categoryStats[category]) {
        categoryStats[category] = { count: 0, minutes: 0 };
      }
      categoryStats[category].count++;
      categoryStats[category].minutes += parseInt(entry.minutes || 0);
    });
    return categoryStats;
  };

  const getWeeklyProgress = () => {
    const weeklyData = {};
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      weeklyData[dateStr] = 0;
    }

    learningEntries.forEach(entry => {
      if (entry.date && weeklyData.hasOwnProperty(entry.date)) {
        weeklyData[entry.date] += parseInt(entry.minutes || 0);
      }
    });

    return weeklyData;
  };

  const getGoalProgress = () => {
    const today = new Date();
    const thisWeekEntries = learningEntries.filter(entry => {
      if (!entry.date) return false;
      const entryDate = new Date(entry.date);
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return entryDate >= weekStart;
    });
    
    const weeklyMinutes = getTotalMinutes(thisWeekEntries);
    const weeklyGoal = parseInt(learningGoal) * 7; // Daily goal * 7 days
    return { current: weeklyMinutes, goal: weeklyGoal, percentage: (weeklyMinutes / weeklyGoal) * 100 };
  };

  const categories = [...new Set(learningEntries.map(entry => entry.category || 'Genel'))];
  const platforms = [...new Set(learningEntries.map(entry => entry.platform).filter(Boolean))];
  const categoryStats = getCategoryStats();
  const weeklyProgress = getWeeklyProgress();
  const goalProgress = getGoalProgress();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Öğrenme Takibi
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'overview' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Genel Bakış
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'analytics' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Analitik
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'goals' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Hedefler
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'add' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Ekle
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Enhanced Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-4 rounded-xl shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-purple-200" size={20} />
                <span className="text-purple-100 font-medium">Toplam Süre</span>
              </div>
              <p className="text-2xl font-bold text-white">{getTotalMinutes()}</p>
              <p className="text-purple-200 text-sm">dakika ({Math.round(getTotalMinutes() / 60)} saat)</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 rounded-xl shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="text-blue-200" size={20} />
                <span className="text-blue-100 font-medium">Toplam Konu</span>
              </div>
              <p className="text-2xl font-bold text-white">{learningEntries.length}</p>
              <p className="text-blue-200 text-sm">öğrenme</p>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-4 rounded-xl shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="text-indigo-200" size={20} />
                <span className="text-indigo-100 font-medium">Ortalama</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {learningEntries.length > 0 ? Math.round(getTotalMinutes() / learningEntries.length) : 0}
              </p>
              <p className="text-indigo-200 text-sm">dk/konu</p>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-800 p-4 rounded-xl shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="text-green-200" size={20} />
                <span className="text-green-100 font-medium">Haftalık Hedef</span>
              </div>
              <p className="text-2xl font-bold text-white">{goalProgress.current}</p>
              <p className="text-green-200 text-sm">/ {goalProgress.goal} dk</p>
            </div>
          </div>

          {/* Weekly Progress Chart */}
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <h3 className="font-semibold text-xl mb-4 text-gray-100">Son 7 Gün</h3>
            <div className="relative h-32">
              <div className="absolute inset-0 flex items-end justify-between gap-2">
                {Object.entries(weeklyProgress).map(([date, minutes]) => {
                  const maxMinutes = Math.max(...Object.values(weeklyProgress));
                  const height = maxMinutes > 0 ? (minutes / maxMinutes) * 100 : 0;
                  const dayName = new Date(date).toLocaleDateString('tr-TR', { weekday: 'short' });
                  
                  return (
                    <div key={date} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t transition-all hover:opacity-80"
                        style={{ height: `${height}%` }}
                        title={`${dayName}: ${minutes} dakika`}
                      ></div>
                      <span className="text-xs text-gray-400 mt-2">{dayName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="all">Tüm Platformlar</option>
              {platforms.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="all">Tüm Zamanlar</option>
              <option value="week">Son Hafta</option>
              <option value="month">Son Ay</option>
              <option value="quarter">Son 3 Ay</option>
            </select>
          </div>

          {/* Learning History */}
          <div className="space-y-3">
            <h3 className="font-semibold text-xl text-gray-100 mb-4">
              Öğrenme Geçmişi ({filteredEntries.length} kayıt)
            </h3>
            {filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">📚</div>
                <p>Seçilen filtrelere uygun öğrenme kaydı bulunamadı</p>
              </div>
            ) : (
              filteredEntries.map(entry => (
                <div key={entry.id} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all animate-slide-up">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-purple-400 text-lg">{entry.topic}</h4>
                      <div className="flex items-center gap-4 mt-1 flex-wrap">
                        {entry.category && (
                          <span className="text-sm text-blue-300 bg-blue-500/20 px-2 py-1 rounded">
                            🏷️ {entry.category}
                          </span>
                        )}
                        {entry.platform && (
                          <span className="text-sm text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                            📖 {entry.platform}
                          </span>
                        )}
                        {entry.minutes && (
                          <span className="text-sm text-purple-300 bg-purple-500/20 px-2 py-1 rounded">
                            ⏱️ {entry.minutes} dk
                          </span>
                        )}
                        {entry.date && (
                          <span className="text-sm text-gray-500">
                            📅 {entry.date}
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteLearningEntry(entry.id)} 
                      className="text-red-400 hover:text-red-300 hover:scale-110 transition-all ml-3"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Category Statistics */}
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <h3 className="font-semibold text-xl mb-4 text-gray-100">Kategori Analizi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(categoryStats).map(([category, stats]) => (
                <div key={category} className="bg-gray-700/50 p-4 rounded-xl border border-gray-600/50">
                  <h4 className="font-medium text-purple-400 mb-2">{category}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Toplam Süre:</span>
                      <span className="text-white font-medium">{stats.totalMinutes} dk</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Konu Sayısı:</span>
                      <span className="text-white font-medium">{stats.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Ortalama:</span>
                      <span className="text-white font-medium">{Math.round(stats.totalMinutes / stats.count)} dk</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Analysis */}
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <h3 className="font-semibold text-xl mb-4 text-gray-100">Platform Analizi</h3>
            <div className="space-y-3">
              {topPlatforms.map((platform, index) => {
                const percentage = getTotalMinutes() > 0 ? (platform.minutes / getTotalMinutes() * 100) : 0;
                return (
                  <div key={platform.name} className="bg-gray-700/50 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-100">#{index + 1} {platform.name}</span>
                      <span className="text-purple-400 font-medium">{platform.minutes} dk</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      %{percentage.toFixed(1)} • {platform.count} konu
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Distribution Chart */}
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <h3 className="font-semibold text-xl mb-4 text-gray-100">Zaman Dağılımı</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-300 mb-3">Kategorilere Göre</h4>
                <div className="space-y-2">
                  {Object.entries(categoryStats).map(([category, stats]) => {
                    const percentage = getTotalMinutes() > 0 ? (stats.totalMinutes / getTotalMinutes() * 100) : 0;
                    return (
                      <div key={category} className="flex items-center gap-3">
                        <div className="w-16 text-xs text-gray-400">{category}</div>
                        <div className="flex-1 bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="w-12 text-xs text-gray-300 text-right">
                          %{percentage.toFixed(0)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-300 mb-3">Platformlara Göre</h4>
                <div className="space-y-2">
                  {topPlatforms.slice(0, 5).map((platform) => {
                    const percentage = getTotalMinutes() > 0 ? (platform.minutes / getTotalMinutes() * 100) : 0;
                    return (
                      <div key={platform.name} className="flex items-center gap-3">
                        <div className="w-16 text-xs text-gray-400 truncate">{platform.name}</div>
                        <div className="flex-1 bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="w-12 text-xs text-gray-300 text-right">
                          %{percentage.toFixed(0)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-6">
          {/* Goal Setting */}
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <h3 className="font-semibold text-xl mb-4 text-gray-100">Haftalık Öğrenme Hedefi</h3>
            <div className="flex items-center gap-4 mb-6">
              <input
                type="number"
                value={learningGoal}
                onChange={(e) => setLearningGoal(Number(e.target.value))}
                placeholder="Hedef (dakika)"
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                min="0"
              />
              <span className="text-gray-300">dakika/hafta</span>
            </div>
            
            {/* Goal Progress */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Bu Hafta İlerleme</span>
                <span className="text-purple-400 font-medium">
                  {goalProgress.current} / {goalProgress.goal} dk
                </span>
              </div>
              
              <div className="w-full bg-gray-600 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all ${
                    goalProgress.percentage >= 100 
                      ? 'bg-gradient-to-r from-green-500 to-green-400' 
                      : 'bg-gradient-to-r from-purple-500 to-blue-500'
                  }`}
                  style={{ width: `${Math.min(goalProgress.percentage, 100)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">%{goalProgress.percentage.toFixed(1)} tamamlandı</span>
                <span className={`font-medium ${
                  goalProgress.percentage >= 100 ? 'text-green-400' : 'text-purple-400'
                }`}>
                  {goalProgress.percentage >= 100 ? '🎉 Hedef tamamlandı!' : `${goalProgress.goal - goalProgress.current} dk kaldı`}
                </span>
              </div>
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <h3 className="font-semibold text-xl mb-4 text-gray-100">Başarılar</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-xl text-center ${
                getTotalMinutes() >= 60 ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-gray-700/50 border border-gray-600/50'
              }`}>
                <div className="text-2xl mb-2">🥉</div>
                <div className="text-sm font-medium">İlk Saat</div>
                <div className="text-xs text-gray-400">60+ dakika</div>
              </div>
              
              <div className={`p-4 rounded-xl text-center ${
                getTotalMinutes() >= 300 ? 'bg-gray-400/20 border border-gray-400/50' : 'bg-gray-700/50 border border-gray-600/50'
              }`}>
                <div className="text-2xl mb-2">🥈</div>
                <div className="text-sm font-medium">Kararlı</div>
                <div className="text-xs text-gray-400">5+ saat</div>
              </div>
              
              <div className={`p-4 rounded-xl text-center ${
                getTotalMinutes() >= 600 ? 'bg-yellow-400/20 border border-yellow-400/50' : 'bg-gray-700/50 border border-gray-600/50'
              }`}>
                <div className="text-2xl mb-2">🥇</div>
                <div className="text-sm font-medium">Uzman</div>
                <div className="text-xs text-gray-400">10+ saat</div>
              </div>
              
              <div className={`p-4 rounded-xl text-center ${
                learningEntries.length >= 50 ? 'bg-purple-500/20 border border-purple-500/50' : 'bg-gray-700/50 border border-gray-600/50'
              }`}>
                <div className="text-2xl mb-2">🏆</div>
                <div className="text-sm font-medium">Öğrenme Makinesi</div>
                <div className="text-xs text-gray-400">50+ konu</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'add' && (
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-xl">
          <h3 className="font-semibold text-xl mb-4 text-gray-100">Yeni Öğrenme Ekle</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <input
                type="text"
                value={newLearning.topic}
                onChange={(e) => setNewLearning({...newLearning, topic: e.target.value})}
                placeholder="Konu"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              />
              
              <select
                value={newLearning.category || ''}
                onChange={(e) => setNewLearning({...newLearning, category: e.target.value})}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="">Kategori Seçin</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <input
                type="text"
                value={newLearning.platform}
                onChange={(e) => setNewLearning({...newLearning, platform: e.target.value})}
                placeholder="Platform (YouTube, Udemy, vb.)"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div className="space-y-3">
              <input
                type="number"
                value={newLearning.minutes}
                onChange={(e) => setNewLearning({...newLearning, minutes: e.target.value})}
                placeholder="Süre (dakika)"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                min="1"
              />
              
              <input
                type="date"
                value={newLearning.date}
                onChange={(e) => setNewLearning({...newLearning, date: e.target.value})}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              />
              
              <button 
                onClick={handleAddLearning}
                disabled={!newLearning.topic || !newLearning.minutes}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="inline mr-2" size={16} />
                Öğrenme Ekle
              </button>
            </div>
          </div>
          
          {/* Quick Add Suggestions */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-300 mb-3">Hızlı Ekle</h4>
            <div className="flex flex-wrap gap-2">
              {['JavaScript', 'React', 'Python', 'Machine Learning', 'UI/UX Design'].map(topic => (
                <button
                  key={topic}
                  onClick={() => setNewLearning({...newLearning, topic})}
                  className="px-3 py-1 bg-gray-700 hover:bg-purple-600 text-gray-300 hover:text-white rounded-full text-sm transition-all"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      

    </div>
  );
};

export default LearningTracker;