import React, { useState, useEffect } from 'react';
import { Moon, Sun, Clock, Calendar, TrendingUp, Award, Bed, Coffee, Star, Heart, Brain, Eye } from 'lucide-react';

const SleepTracker = ({ sleepData, setSleepData }) => {
  const [activeTab, setActiveTab] = useState('log');
  const [newSleep, setNewSleep] = useState({
    date: new Date().toISOString().split('T')[0],
    bedTime: '',
    wakeTime: '',
    quality: 5,
    mood: 'good',
    notes: ''
  });
  const [showStats, setShowStats] = useState(false);

  const sleepQualities = [
    { value: 1, label: 'Çok Kötü', color: 'red', icon: '😴' },
    { value: 2, label: 'Kötü', color: 'orange', icon: '😪' },
    { value: 3, label: 'Orta', color: 'yellow', icon: '😐' },
    { value: 4, label: 'İyi', color: 'blue', icon: '😊' },
    { value: 5, label: 'Mükemmel', color: 'green', icon: '😄' }
  ];

  const moods = [
    { id: 'tired', name: 'Yorgun', icon: '😴', color: 'gray' },
    { id: 'refreshed', name: 'Dinlenmiş', icon: '😊', color: 'green' },
    { id: 'good', name: 'İyi', icon: '🙂', color: 'blue' },
    { id: 'energetic', name: 'Enerjik', icon: '⚡', color: 'yellow' },
    { id: 'groggy', name: 'Sersem', icon: '😵', color: 'orange' }
  ];

  const addSleepEntry = () => {
    if (!newSleep.bedTime || !newSleep.wakeTime) return;

    const bedDateTime = new Date(`${newSleep.date}T${newSleep.bedTime}`);
    const wakeDateTime = new Date(`${newSleep.date}T${newSleep.wakeTime}`);
    
    // Eğer yatış saati uyanış saatinden sonraysa, ertesi güne geçir
    if (bedDateTime > wakeDateTime) {
      wakeDateTime.setDate(wakeDateTime.getDate() + 1);
    }

    const duration = (wakeDateTime - bedDateTime) / (1000 * 60 * 60); // saat cinsinden

    const sleepEntry = {
      id: Date.now(),
      ...newSleep,
      duration: Math.round(duration * 100) / 100,
      timestamp: new Date().toISOString()
    };

    setSleepData(prev => [...(prev || []), sleepEntry]);
    setNewSleep({
      date: new Date().toISOString().split('T')[0],
      bedTime: '',
      wakeTime: '',
      quality: 5,
      mood: 'good',
      notes: ''
    });
  };

  const deleteSleepEntry = (id) => {
    setSleepData(prev => prev.filter(entry => entry.id !== id));
  };

  const getAverageSleep = () => {
    const entries = sleepData || [];
    if (entries.length === 0) return 0;
    const total = entries.reduce((sum, entry) => sum + entry.duration, 0);
    return Math.round((total / entries.length) * 100) / 100;
  };

  const getAverageQuality = () => {
    const entries = sleepData || [];
    if (entries.length === 0) return 0;
    const total = entries.reduce((sum, entry) => sum + entry.quality, 0);
    return Math.round((total / entries.length) * 10) / 10;
  };

  const getSleepStreak = () => {
    const entries = sleepData || [];
    if (entries.length === 0) return 0;

    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasEntry = entries.some(entry => entry.date === dateStr);
      
      if (hasEntry) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const getWeeklyData = () => {
    const entries = sleepData || [];
    const weekData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('tr-TR', { weekday: 'short' });
      const dayEntry = entries.find(entry => entry.date === dateStr);
      
      weekData.push({
        date: dateStr,
        day: dayName,
        duration: dayEntry?.duration || 0,
        quality: dayEntry?.quality || 0,
        hasData: !!dayEntry
      });
    }
    
    return weekData;
  };

  const getSleepTrend = () => {
    const entries = sleepData || [];
    const last7Days = entries.slice(-7);
    const last14Days = entries.slice(-14, -7);
    
    if (last7Days.length === 0 || last14Days.length === 0) return 'stable';
    
    const avg7 = last7Days.reduce((sum, entry) => sum + entry.duration, 0) / last7Days.length;
    const avg14 = last14Days.reduce((sum, entry) => sum + entry.duration, 0) / last14Days.length;
    
    const diff = avg7 - avg14;
    if (diff > 0.5) return 'improving';
    if (diff < -0.5) return 'declining';
    return 'stable';
  };

  const getSleepScore = () => {
    const avgDuration = getAverageSleep();
    const avgQuality = getAverageQuality();
    const streak = getSleepStreak();
    
    let score = 0;
    
    // Süre skoru (0-40 puan)
    if (avgDuration >= 7 && avgDuration <= 9) score += 40;
    else if (avgDuration >= 6 && avgDuration <= 10) score += 30;
    else if (avgDuration >= 5 && avgDuration <= 11) score += 20;
    else score += 10;
    
    // Kalite skoru (0-40 puan)
    score += (avgQuality / 5) * 40;
    
    // Tutarlılık skoru (0-20 puan)
    score += Math.min(streak * 2, 20);
    
    return Math.round(score);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}s ${m}dk`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Sleep Tracker
        </h2>
        <button 
          onClick={() => setShowStats(!showStats)}
          className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-xl transition-all"
        >
          <TrendingUp size={20} />
        </button>
      </div>

      {/* İstatistikler */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl text-white">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={24} />
              <span className="text-lg font-semibold">Ortalama Uyku</span>
            </div>
            <div className="text-3xl font-bold">{formatDuration(getAverageSleep())}</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-2xl text-white">
            <div className="flex items-center gap-3 mb-2">
              <Star size={24} />
              <span className="text-lg font-semibold">Ortalama Kalite</span>
            </div>
            <div className="text-3xl font-bold">{getAverageQuality()}/5</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-2xl text-white">
            <div className="flex items-center gap-3 mb-2">
              <Award size={24} />
              <span className="text-lg font-semibold">Seri</span>
            </div>
            <div className="text-3xl font-bold">{getSleepStreak()} gün</div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-2xl text-white">
            <div className="flex items-center gap-3 mb-2">
              <Brain size={24} />
              <span className="text-lg font-semibold">Uyku Skoru</span>
            </div>
            <div className="text-3xl font-bold">{getSleepScore()}/100</div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-xl">
        {[
          { id: 'log', name: 'Kayıt', icon: Bed },
          { id: 'history', name: 'Geçmiş', icon: Calendar },
          { id: 'analysis', name: 'Analiz', icon: TrendingUp }
        ].map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
              }`}
            >
              <IconComponent size={20} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {activeTab === 'log' && (
        <div className="space-y-6">
          {/* Uyku Kaydı Formu */}
          <div className="bg-gray-800 p-6 rounded-2xl">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Yeni Uyku Kaydı</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-300 mb-2">Tarih</label>
                <input
                  type="date"
                  value={newSleep.date}
                  onChange={(e) => setNewSleep(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-300 mb-2">Yatış Saati</label>
                  <input
                    type="time"
                    value={newSleep.bedTime}
                    onChange={(e) => setNewSleep(prev => ({ ...prev, bedTime: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Uyanış Saati</label>
                  <input
                    type="time"
                    value={newSleep.wakeTime}
                    onChange={(e) => setNewSleep(prev => ({ ...prev, wakeTime: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Uyku Kalitesi */}
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Uyku Kalitesi</label>
              <div className="flex gap-2">
                {sleepQualities.map(quality => (
                  <button
                    key={quality.value}
                    onClick={() => setNewSleep(prev => ({ ...prev, quality: quality.value }))}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      newSleep.quality === quality.value
                        ? `border-${quality.color}-500 bg-${quality.color}-500/20`
                        : 'border-gray-700 bg-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">{quality.icon}</div>
                    <div className="text-xs text-gray-300">{quality.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sabah Ruh Hali */}
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Sabah Ruh Hali</label>
              <div className="flex gap-2">
                {moods.map(mood => (
                  <button
                    key={mood.id}
                    onClick={() => setNewSleep(prev => ({ ...prev, mood: mood.id }))}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      newSleep.mood === mood.id
                        ? `border-${mood.color}-500 bg-${mood.color}-500/20`
                        : 'border-gray-700 bg-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-xl mb-1">{mood.icon}</div>
                    <div className="text-xs text-gray-300">{mood.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notlar */}
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Notlar (İsteğe bağlı)</label>
              <textarea
                value={newSleep.notes}
                onChange={(e) => setNewSleep(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Uyku hakkında notlarınız..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white h-20 resize-none"
              />
            </div>

            <button
              onClick={addSleepEntry}
              disabled={!newSleep.bedTime || !newSleep.wakeTime}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-all"
            >
              Uyku Kaydı Ekle
            </button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Haftalık Görünüm */}
          <div>
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Bu Hafta</h3>
            <div className="grid grid-cols-7 gap-2">
              {getWeeklyData().map((day, index) => (
                <div key={index} className={`p-3 rounded-lg text-center ${
                  day.hasData ? 'bg-indigo-800' : 'bg-gray-800'
                }`}>
                  <div className="text-sm text-gray-400 mb-1">{day.day}</div>
                  <div className="text-lg font-semibold text-gray-100">
                    {day.hasData ? formatDuration(day.duration) : '-'}
                  </div>
                  {day.hasData && (
                    <div className="flex justify-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < day.quality ? 'text-yellow-400 fill-current' : 'text-gray-600'}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Son Kayıtlar */}
          <div>
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Son Kayıtlar</h3>
            <div className="space-y-3">
              {(sleepData || []).slice(-10).reverse().map(entry => {
                const quality = sleepQualities.find(q => q.value === entry.quality);
                const mood = moods.find(m => m.id === entry.mood);
                
                return (
                  <div key={entry.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-semibold text-gray-100">
                          {new Date(entry.date).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="text-2xl">{quality?.icon}</div>
                        <div className="text-xl">{mood?.icon}</div>
                      </div>
                      
                      <button
                        onClick={() => deleteSleepEntry(entry.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Yatış:</span>
                        <div className="text-gray-100">{formatTime(entry.bedTime)}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Uyanış:</span>
                        <div className="text-gray-100">{formatTime(entry.wakeTime)}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Süre:</span>
                        <div className="text-gray-100">{formatDuration(entry.duration)}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Kalite:</span>
                        <div className="text-gray-100">{entry.quality}/5</div>
                      </div>
                    </div>
                    
                    {entry.notes && (
                      <div className="mt-2 text-sm text-gray-400">
                        <span className="font-medium">Not:</span> {entry.notes}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {(!sleepData || sleepData.length === 0) && (
                <div className="text-center py-12">
                  <Moon size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Henüz uyku kaydı yok</p>
                  <p className="text-gray-500">İlk kaydınızı eklemek için Kayıt sekmesini kullanın</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {/* Uyku Skoru */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-800 p-6 rounded-2xl text-white">
            <h3 className="text-2xl font-semibold mb-4">Uyku Skoru</h3>
            <div className="text-6xl font-bold mb-2">{getSleepScore()}/100</div>
            <div className="text-lg opacity-90">
              {getSleepScore() >= 80 ? 'Mükemmel uyku kalitesi!' :
               getSleepScore() >= 60 ? 'İyi uyku kalitesi' :
               getSleepScore() >= 40 ? 'Orta uyku kalitesi' :
               'Uyku kalitenizi iyileştirmelisiniz'}
            </div>
          </div>

          {/* Trend Analizi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-6 rounded-2xl">
              <h4 className="text-lg font-semibold text-gray-100 mb-3">Uyku Trendi</h4>
              <div className="flex items-center gap-3">
                {getSleepTrend() === 'improving' && (
                  <>
                    <TrendingUp className="text-green-400" size={24} />
                    <span className="text-green-400">İyileşiyor</span>
                  </>
                )}
                {getSleepTrend() === 'declining' && (
                  <>
                    <TrendingUp className="text-red-400 rotate-180" size={24} />
                    <span className="text-red-400">Kötüleşiyor</span>
                  </>
                )}
                {getSleepTrend() === 'stable' && (
                  <>
                    <TrendingUp className="text-blue-400" size={24} />
                    <span className="text-blue-400">Stabil</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-2xl">
              <h4 className="text-lg font-semibold text-gray-100 mb-3">Öneriler</h4>
              <div className="space-y-2 text-sm text-gray-300">
                {getAverageSleep() < 7 && (
                  <div>• Daha fazla uyumaya çalışın (7-9 saat ideal)</div>
                )}
                {getAverageQuality() < 4 && (
                  <div>• Uyku kalitenizi artırmak için uyku hijyenine dikkat edin</div>
                )}
                {getSleepStreak() < 7 && (
                  <div>• Düzenli uyku saatleri oluşturmaya çalışın</div>
                )}
                <div>• Yatmadan önce ekran kullanımını azaltın</div>
                <div>• Yatak odanızı serin ve karanlık tutun</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SleepTracker;