import React, { useState, useEffect } from 'react';
import { Brain, Play, Pause, Square, Clock, Calendar, TrendingUp, Award, Flower, Wind, Heart, Moon, Sun, Volume2, VolumeX, Plus, Save } from 'lucide-react';

const MeditationTracker = ({ meditationData, setMeditationData }) => {
  const [activeTab, setActiveTab] = useState('timer');
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 dakika
  const [selectedType, setSelectedType] = useState('mindfulness');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showStats, setShowStats] = useState(false);

  // Manuel giriş için state'ler
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualDuration, setManualDuration] = useState(10);
  const [manualType, setManualType] = useState('mindfulness');
  const [manualTime, setManualTime] = useState('12:00');

  const meditationTypes = [
    { id: 'mindfulness', name: 'Mindfulness', icon: Brain, color: 'blue', description: 'Farkındalık meditasyonu' },
    { id: 'breathing', name: 'Nefes Çalışması', icon: Wind, color: 'green', description: 'Nefes odaklı meditasyon' },
    { id: 'body-scan', name: 'Vücut Taraması', icon: Flower, color: 'purple', description: 'Vücut farkındalığı meditasyonu' },
    { id: 'sleep', name: 'Uyku Meditasyonu', icon: Moon, color: 'indigo', description: 'Uyku öncesi rahatlatıcı meditasyon' },
    { id: 'morning', name: 'Sabah Meditasyonu', icon: Sun, color: 'yellow', description: 'Güne başlama meditasyonu' }
  ];

  const presetTimes = [5, 10, 15, 20, 30, 45, 60];

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    
    if (soundEnabled) {
      playCompletionSound();
    }

    const newSession = {
      id: Date.now(),
      type: selectedType,
      duration: timerMinutes,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      completed: true
    };

    setMeditationData(prev => [...(prev || []), newSession]);
  };

  const playCompletionSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Tibetan bowl sound simulation
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 2);
  };

  const startTimer = () => {
    setTimeLeft(timerMinutes * 60);
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerMinutes * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalSessions = () => {
    return (meditationData || []).length;
  };

  const getTotalMinutes = () => {
    return (meditationData || []).reduce((sum, session) => sum + session.duration, 0);
  };

  const getStreak = () => {
    const sessions = meditationData || [];
    if (sessions.length === 0) return 0;

    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasSession = sessions.some(session => session.date === dateStr);
      
      if (hasSession) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const getWeeklyData = () => {
    const sessions = meditationData || [];
    const weekData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('tr-TR', { weekday: 'short' });
      const daySessions = sessions.filter(session => session.date === dateStr);
      const totalMinutes = daySessions.reduce((sum, session) => sum + session.duration, 0);
      
      weekData.push({
        date: dateStr,
        day: dayName,
        minutes: totalMinutes,
        sessions: daySessions.length
      });
    }
    
    return weekData;
  };

  const selectedTypeData = meditationTypes.find(type => type.id === selectedType);

  // Manuel giriş fonksiyonu
  const handleManualEntry = () => {
    if (!manualDate || !manualDuration || !manualType) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    const [hours, minutes] = manualTime.split(':').map(Number);
    const entryDate = new Date(manualDate);
    entryDate.setHours(hours, minutes, 0, 0);

    const newSession = {
      id: Date.now(),
      type: manualType,
      duration: parseInt(manualDuration),
      date: manualDate,
      timestamp: entryDate.toISOString(),
      completed: true,
      manual: true // Manuel girişi işaretle
    };

    setMeditationData(prev => [...(prev || []), newSession]);
    
    // Form'u temizle
    setManualDate(new Date().toISOString().split('T')[0]);
    setManualDuration(10);
    setManualType('mindfulness');
    setManualTime('12:00');
    
    alert('Meditasyon seansı başarıyla eklendi!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Meditation Tracker
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-2xl text-white">
            <div className="flex items-center gap-3 mb-2">
              <Brain size={24} />
              <span className="text-lg font-semibold">Toplam Seans</span>
            </div>
            <div className="text-3xl font-bold">{getTotalSessions()}</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl text-white">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={24} />
              <span className="text-lg font-semibold">Toplam Süre</span>
            </div>
            <div className="text-3xl font-bold">{getTotalMinutes()} dk</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-2xl text-white">
            <div className="flex items-center gap-3 mb-2">
              <Award size={24} />
              <span className="text-lg font-semibold">Seri</span>
            </div>
            <div className="text-3xl font-bold">{getStreak()} gün</div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-xl">
        {[
          { id: 'timer', name: 'Timer', icon: Clock },
          { id: 'manual', name: 'Manuel Giriş', icon: Plus },
          { id: 'history', name: 'Geçmiş', icon: Calendar }
        ].map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
              }`}
            >
              <IconComponent size={20} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {activeTab === 'timer' && (
        <div className="space-y-6">
          {/* Meditasyon Türü Seçimi */}
          <div>
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Meditasyon Türü</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meditationTypes.map(type => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedType === type.id
                        ? `border-${type.color}-500 bg-${type.color}-500/20`
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <IconComponent size={24} className={`text-${type.color}-400`} />
                      <span className="font-semibold text-gray-100">{type.name}</span>
                    </div>
                    <p className="text-sm text-gray-400 text-left">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Süre Seçimi */}
          <div>
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Süre Seçimi</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              {presetTimes.map(time => (
                <button
                  key={time}
                  onClick={() => {
                    setTimerMinutes(time);
                    setTimeLeft(time * 60);
                  }}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    timerMinutes === time
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {time} dk
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={timerMinutes}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setTimerMinutes(value);
                  setTimeLeft(value * 60);
                }}
                className="w-24 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                min="1"
                max="120"
              />
              <span className="text-gray-400">dakika</span>
              
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg transition-all ${
                  soundEnabled ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
            </div>
          </div>

          {/* Timer */}
          <div className={`bg-gradient-to-br from-${selectedTypeData.color}-600 to-${selectedTypeData.color}-800 p-8 rounded-2xl text-center text-white`}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <selectedTypeData.icon size={32} />
              <h3 className="text-2xl font-semibold">{selectedTypeData.name}</h3>
            </div>
            
            <div className="text-6xl font-mono font-bold mb-6">
              {formatTime(timeLeft)}
            </div>
            
            <div className="flex justify-center gap-4">
              {!isRunning ? (
                <button 
                  onClick={startTimer}
                  className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2"
                >
                  <Play size={24} />
                  Başla
                </button>
              ) : (
                <button 
                  onClick={pauseTimer}
                  className="bg-yellow-500 hover:bg-yellow-600 px-8 py-4 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2"
                >
                  <Pause size={24} />
                  Duraklat
                </button>
              )}
              
              <button 
                onClick={stopTimer}
                className="bg-red-500 hover:bg-red-600 px-8 py-4 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2"
              >
                <Square size={24} />
                Durdur
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'manual' && (
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-2xl">
            <h3 className="text-xl font-semibold text-gray-100 mb-6 flex items-center gap-3">
              <Plus size={24} className="text-purple-400" />
              Geçmiş Meditasyon Seansı Ekle
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tarih Seçimi */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tarih
                </label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Saat Seçimi */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Saat
                </label>
                <input
                  type="time"
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Süre Seçimi */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Süre (dakika)
                </label>
                <div className="flex gap-2 mb-3">
                  {presetTimes.map(time => (
                    <button
                      key={time}
                      onClick={() => setManualDuration(time)}
                      className={`px-3 py-1 rounded-lg text-sm transition-all ${
                        manualDuration === time
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={manualDuration}
                  onChange={(e) => setManualDuration(parseInt(e.target.value) || 1)}
                  min="1"
                  max="180"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Meditasyon Türü */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meditasyon Türü
                </label>
                <select
                  value={manualType}
                  onChange={(e) => setManualType(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {meditationTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Seçilen Tür Önizlemesi */}
            <div className="mt-6">
              {(() => {
                const selectedManualType = meditationTypes.find(type => type.id === manualType);
                const IconComponent = selectedManualType?.icon || Brain;
                return (
                  <div className={`bg-gradient-to-r from-${selectedManualType?.color || 'purple'}-600/20 to-${selectedManualType?.color || 'purple'}-800/20 p-4 rounded-lg border border-${selectedManualType?.color || 'purple'}-500/30`}>
                    <div className="flex items-center gap-3 mb-2">
                      <IconComponent size={20} className={`text-${selectedManualType?.color || 'purple'}-400`} />
                      <span className="font-semibold text-gray-100">{selectedManualType?.name}</span>
                    </div>
                    <p className="text-sm text-gray-400">{selectedManualType?.description}</p>
                    <div className="mt-2 text-sm text-gray-300">
                      <span className="font-medium">{manualDuration} dakika</span> • 
                      <span className="ml-1">{new Date(manualDate + 'T' + manualTime).toLocaleDateString('tr-TR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Kaydet Butonu */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleManualEntry}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2"
              >
                <Save size={20} />
                Seansı Kaydet
              </button>
            </div>
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
                <div key={index} className="bg-gray-800 p-3 rounded-lg text-center">
                  <div className="text-sm text-gray-400 mb-1">{day.day}</div>
                  <div className="text-lg font-semibold text-gray-100">{day.minutes}</div>
                  <div className="text-xs text-gray-500">dk</div>
                  {day.sessions > 0 && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full mx-auto mt-1"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Son Seanslar */}
          <div>
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Son Seanslar</h3>
            <div className="space-y-3">
              {(meditationData || []).slice(-10).reverse().map(session => {
                const type = meditationTypes.find(t => t.id === session.type);
                const IconComponent = type?.icon || Brain;
                
                return (
                  <div key={session.id} className="bg-gray-800 p-4 rounded-lg flex items-center gap-4">
                    <div className={`p-2 rounded-lg bg-${type?.color || 'purple'}-500/20`}>
                      <IconComponent size={20} className={`text-${type?.color || 'purple'}-400`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-semibold text-gray-100">{type?.name || 'Meditasyon'}</div>
                      <div className="text-sm text-gray-400">
                        {session.duration} dakika • {new Date(session.timestamp).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                    
                    <div className="text-green-400">
                      <Award size={20} />
                    </div>
                  </div>
                );
              })}
              
              {(!meditationData || meditationData.length === 0) && (
                <div className="text-center py-12">
                  <Flower size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Henüz meditasyon seansı yok</p>
                  <p className="text-gray-500">İlk seansınızı başlatmak için Timer sekmesini kullanın</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeditationTracker;