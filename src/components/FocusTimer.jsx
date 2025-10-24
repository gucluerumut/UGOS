import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Plus, Clock, Target, Settings, Volume2, VolumeX, RotateCcw, Coffee, Brain, Zap, Building2, Trash2 } from 'lucide-react';
import CityBuilder from './CityBuilder';

const FocusTimer = ({ focusEntries, setFocusEntries }) => {
  const [focusTime, setFocusTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [manualMinutes, setManualMinutes] = useState('');
  const [timerMode, setTimerMode] = useState('focus'); // 'focus', 'shortBreak', 'longBreak'
  const [pomodoroSettings, setPomodoroSettings] = useState({
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    soundEnabled: true,
    autoStart: false
  });
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [showCityView, setShowCityView] = useState(false);
  
  // Manuel giriş için yeni state değişkenleri
  const [activeTab, setActiveTab] = useState('timer'); // 'timer', 'manual', 'history', 'city'
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualTime, setManualTime] = useState('12:00');
  const [manualDuration, setManualDuration] = useState('');
  const [manualType, setManualType] = useState('focus');
  
  const audioRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isRunning && focusTime > 0) {
      interval = setInterval(() => {
        setFocusTime(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, focusTime]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (pomodoroSettings.soundEnabled) {
      playNotificationSound();
    }

    if (timerMode === 'focus') {
      const newEntry = {
        id: Date.now(),
        minutes: pomodoroSettings.focusTime,
        date: new Date().toISOString().split('T')[0],
        type: 'pomodoro'
      };
      setFocusEntries(prev => [...prev, newEntry]);
      setPomodoroCount(prev => prev + 1);
      
      // Otomatik mola başlatma
      if (pomodoroSettings.autoStart) {
        const nextMode = (pomodoroCount + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
        setTimerMode(nextMode);
        setFocusTime(nextMode === 'longBreak' ? pomodoroSettings.longBreak * 60 : pomodoroSettings.shortBreak * 60);
        setIsRunning(true);
      }
    } else {
      // Mola tamamlandı
      if (pomodoroSettings.autoStart) {
        setTimerMode('focus');
        setFocusTime(pomodoroSettings.focusTime * 60);
        setIsRunning(true);
      }
    }
  };

  const playNotificationSound = () => {
    // Web Audio API ile basit bir bildirim sesi
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const startPomodoro = (mode) => {
    setTimerMode(mode);
    const minutes = mode === 'focus' ? pomodoroSettings.focusTime : 
                   mode === 'shortBreak' ? pomodoroSettings.shortBreak : 
                   pomodoroSettings.longBreak;
    setFocusTime(minutes * 60);
    setIsRunning(true);
    setCurrentSession({ mode, startTime: Date.now() });
  };

  const startTimer = () => {
    if (focusTime === 0) {
      startPomodoro('focus');
    } else {
      setIsRunning(true);
    }
  };

  const pauseTimer = () => setIsRunning(false);
  
  const stopTimer = () => {
    setIsRunning(false);
    if (focusTime > 0 && timerMode === 'focus') {
      const completedMinutes = Math.ceil((pomodoroSettings.focusTime * 60 - focusTime) / 60);
      if (completedMinutes > 0) {
        const newEntry = {
          id: Date.now(),
          minutes: completedMinutes,
          date: new Date().toISOString().split('T')[0],
          type: 'manual'
        };
        setFocusEntries(prev => [...prev, newEntry]);
      }
    }
    setFocusTime(0);
    setCurrentSession(null);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setFocusTime(0);
    setCurrentSession(null);
  };

  const addManualTime = () => {
    if (manualMinutes && parseInt(manualMinutes) > 0) {
      const newEntry = {
        id: Date.now(),
        minutes: parseInt(manualMinutes),
        date: new Date().toISOString().split('T')[0],
        type: 'manual'
      };
      setFocusEntries(prev => [...prev, newEntry]);
      setManualMinutes('');
    }
  };

  // Manuel giriş fonksiyonu
  const handleManualEntry = () => {
    if (!manualDate || !manualTime || !manualDuration || !manualType) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }

    const [hours, minutes] = manualTime.split(':').map(Number);
    const entryDate = new Date(manualDate);
    entryDate.setHours(hours, minutes, 0, 0);

    const newEntry = {
      id: Date.now(),
      date: manualDate, // ISO formatını kullan (YYYY-MM-DD)
      time: manualTime,
      minutes: parseInt(manualDuration),
      type: manualType,
      timestamp: entryDate.getTime()
    };

    setFocusEntries(prev => [...prev, newEntry]);
    
    // Formu temizle
    setManualDate('');
    setManualTime('');
    setManualDuration('');
    setManualType('');
    
    alert('Focus seansı başarıyla kaydedildi!');
  };

  // Focus girişini silme fonksiyonu
  const handleDeleteEntry = (entryId) => {
    console.log('Silme işlemi başlatıldı, ID:', entryId);
    console.log('Mevcut entries:', focusEntries);
    
    if (window.confirm('Bu focus seansını silmek istediğinizden emin misiniz?')) {
      console.log('Kullanıcı silme işlemini onayladı');
      setFocusEntries(prev => {
        const filtered = prev.filter(entry => entry.id !== entryId);
        console.log('Silme sonrası entries:', filtered);
        return filtered;
      });
      alert('Focus seansı başarıyla silindi!');
    } else {
      console.log('Kullanıcı silme işlemini iptal etti');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTotalFocusTime = () => {
    return focusEntries.reduce((sum, entry) => sum + entry.minutes, 0);
  };

  const getTodayFocusTime = () => {
    const today = new Date().toISOString().split('T')[0];
    return focusEntries
      .filter(entry => entry.date === today)
      .reduce((sum, entry) => sum + entry.minutes, 0);
  };

  const getWeeklyFocusTime = () => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return focusEntries
      .filter(entry => new Date(entry.date) >= weekAgo)
      .reduce((sum, entry) => sum + entry.minutes, 0);
  };

  const getPomodoroStats = () => {
    const pomodoroEntries = focusEntries.filter(entry => entry.type === 'pomodoro');
    const today = new Date().toISOString().split('T')[0];
    const todayPomodoros = pomodoroEntries.filter(entry => entry.date === today).length;
    return { total: pomodoroEntries.length, today: todayPomodoros };
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'focus': return <Brain className="text-blue-400" size={24} />;
      case 'shortBreak': return <Coffee className="text-green-400" size={24} />;
      case 'longBreak': return <Zap className="text-purple-400" size={24} />;
      default: return <Clock className="text-gray-400" size={24} />;
    }
  };

  const getModeColor = (mode) => {
    switch (mode) {
      case 'focus': return 'from-blue-600 to-blue-800';
      case 'shortBreak': return 'from-green-600 to-green-800';
      case 'longBreak': return 'from-purple-600 to-purple-800';
      default: return 'from-gray-600 to-gray-800';
    }
  };

  const pomodoroStats = getPomodoroStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Focus Timer</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowCityView(!showCityView)}
            className={`p-3 rounded-xl transition-all ${showCityView ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
            title="Şehir Görünümü"
          >
            <Building2 size={20} />
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-xl transition-all"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Ayarlar Paneli */}
      {showSettings && (
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
          <h3 className="font-semibold text-xl mb-4 text-gray-100">Pomodoro Ayarları</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Focus Süresi (dakika)</label>
              <input
                type="number"
                value={pomodoroSettings.focusTime}
                onChange={(e) => setPomodoroSettings(prev => ({ ...prev, focusTime: parseInt(e.target.value) || 25 }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Kısa Mola (dakika)</label>
              <input
                type="number"
                value={pomodoroSettings.shortBreak}
                onChange={(e) => setPomodoroSettings(prev => ({ ...prev, shortBreak: parseInt(e.target.value) || 5 }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Uzun Mola (dakika)</label>
              <input
                type="number"
                value={pomodoroSettings.longBreak}
                onChange={(e) => setPomodoroSettings(prev => ({ ...prev, longBreak: parseInt(e.target.value) || 15 }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={pomodoroSettings.soundEnabled}
                  onChange={(e) => setPomodoroSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                  className="rounded"
                />
                Sesli Uyarılar
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={pomodoroSettings.autoStart}
                  onChange={(e) => setPomodoroSettings(prev => ({ ...prev, autoStart: e.target.checked }))}
                  className="rounded"
                />
                Otomatik Başlatma
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Ana Timer */}
      <div className={`bg-gradient-to-br ${getModeColor(timerMode)} p-8 rounded-2xl shadow-xl border border-white/10 text-center`}>
        <div className="flex items-center justify-center gap-3 mb-4">
          {getModeIcon(timerMode)}
          <h3 className="text-2xl font-semibold text-white">
            {timerMode === 'focus' ? 'Focus Zamanı' : 
             timerMode === 'shortBreak' ? 'Kısa Mola' : 'Uzun Mola'}
          </h3>
        </div>
        
        <div className="text-7xl font-mono font-bold text-white mb-6">
          {formatTime(focusTime)}
        </div>
        
        <div className="flex justify-center gap-4 mb-6">
          {!isRunning ? (
            <button onClick={startTimer} className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2">
              <Play size={24} />
              Başla
            </button>
          ) : (
            <button onClick={pauseTimer} className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2">
              <Pause size={24} />
              Duraklat
            </button>
          )}
          
          <button onClick={stopTimer} className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2">
            <Square size={24} />
            Durdur
          </button>

          <button onClick={resetTimer} className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2">
            <RotateCcw size={24} />
            Sıfırla
          </button>
        </div>

        {/* Pomodoro Hızlı Başlatma */}
        <div className="flex justify-center gap-3">
          <button 
            onClick={() => startPomodoro('focus')}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
          >
            <Brain size={16} />
            Focus ({pomodoroSettings.focusTime}dk)
          </button>
          <button 
            onClick={() => startPomodoro('shortBreak')}
            className="bg-green-500/20 hover:bg-green-500/30 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
          >
            <Coffee size={16} />
            Kısa Mola ({pomodoroSettings.shortBreak}dk)
          </button>
          <button 
            onClick={() => startPomodoro('longBreak')}
            className="bg-purple-500/20 hover:bg-purple-500/30 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
          >
            <Zap size={16} />
            Uzun Mola ({pomodoroSettings.longBreak}dk)
          </button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 rounded-xl border border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-blue-400" size={20} />
            <span className="text-gray-100 font-medium">Toplam Focus</span>
          </div>
          <div className="text-3xl font-bold text-blue-400">{getTotalFocusTime()}</div>
          <div className="text-gray-400 text-sm">dakika</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-green-400" size={20} />
            <span className="text-gray-100 font-medium">Bugün</span>
          </div>
          <div className="text-3xl font-bold text-green-400">{getTodayFocusTime()}</div>
          <div className="text-gray-400 text-sm">dakika</div>
        </div>

        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-xl border border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="text-purple-400" size={20} />
            <span className="text-gray-100 font-medium">Pomodoro</span>
          </div>
          <div className="text-3xl font-bold text-purple-400">{pomodoroStats.total}</div>
          <div className="text-gray-400 text-sm">toplam</div>
        </div>

        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-4 rounded-xl border border-orange-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-orange-400" size={20} />
            <span className="text-gray-100 font-medium">Bu Hafta</span>
          </div>
          <div className="text-3xl font-bold text-orange-400">{getWeeklyFocusTime()}</div>
          <div className="text-gray-400 text-sm">dakika</div>
        </div>
      </div>

      {/* Sekme Navigasyonu */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl">
        <div className="flex border-b border-gray-700/50">
          <button
            onClick={() => setActiveTab('timer')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
              activeTab === 'timer'
                ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
            }`}
          >
            Timer
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
              activeTab === 'manual'
                ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
            }`}
          >
            Manuel Giriş
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
            }`}
          >
            Geçmiş
          </button>
          <button
            onClick={() => setActiveTab('city')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
              activeTab === 'city'
                ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
            }`}
          >
            🏙️ Şehir
          </button>
        </div>

        <div className="p-6">
          {/* Timer Sekmesi */}
          {activeTab === 'timer' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-xl flex items-center gap-2 text-gray-100">
                <Plus className="text-blue-400" />
                 Manuel Zaman Ekle
               </h3>
               <div className="flex gap-3">
                 <input
                   type="number"
                   value={manualMinutes}
                   onChange={(e) => setManualMinutes(e.target.value)}
                   placeholder="Dakika"
                   className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                 />
                 <button onClick={addManualTime} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                   Ekle
                 </button>
               </div>
             </div>
           )}

           {/* Manuel Giriş Sekmesi */}
           {activeTab === 'manual' && (
             <div className="space-y-6">
               <h3 className="font-semibold text-xl text-gray-100">Geçmiş Focus Seansı Ekle</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-gray-300 mb-2">Tarih</label>
                   <input
                     type="date"
                     value={manualDate}
                     onChange={(e) => setManualDate(e.target.value)}
                     className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-gray-300 mb-2">Saat</label>
                   <input
                     type="time"
                     value={manualTime}
                     onChange={(e) => setManualTime(e.target.value)}
                     className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-gray-300 mb-2">Süre (dakika)</label>
                 <div className="flex gap-2 mb-3">
                   {[15, 25, 30, 45, 60, 90].map(duration => (
                     <button
                       key={duration}
                       onClick={() => setManualDuration(duration.toString())}
                       className={`px-4 py-2 rounded-lg font-medium transition-all ${
                         manualDuration === duration.toString()
                           ? 'bg-blue-600 text-white'
                           : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                       }`}
                     >
                       {duration}dk
                     </button>
                   ))}
                 </div>
                 <input
                   type="number"
                   value={manualDuration}
                   onChange={(e) => setManualDuration(e.target.value)}
                   placeholder="Özel süre girin"
                   className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                 />
               </div>

               <div>
                 <label className="block text-gray-300 mb-2">Focus Türü</label>
                 <select
                   value={manualType}
                   onChange={(e) => setManualType(e.target.value)}
                   className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                 >
                   <option value="focus">Focus</option>
                   <option value="pomodoro">Pomodoro</option>
                   <option value="deep-work">Derin Çalışma</option>
                   <option value="study">Çalışma</option>
                   <option value="reading">Okuma</option>
                   <option value="coding">Kodlama</option>
                 </select>
               </div>

               {manualType && (
                 <div className="bg-gray-700/30 p-4 rounded-lg">
                   <h4 className="font-medium text-gray-200 mb-2">Seçilen Tür:</h4>
                   <div className="flex items-center gap-2">
                     <Brain className="text-blue-400" size={20} />
                     <span className="text-blue-400 font-medium capitalize">{manualType}</span>
                   </div>
                 </div>
               )}

               <button
                 onClick={handleManualEntry}
                 className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 rounded-xl font-semibold transition-all shadow-lg"
               >
                 Focus Seansını Kaydet
               </button>
             </div>
           )}

           {/* Geçmiş Sekmesi */}
           {activeTab === 'history' && (
             <div className="space-y-4">
               <h3 className="font-semibold text-xl text-gray-100">Son Aktiviteler</h3>
               {focusEntries.length === 0 ? (
                 <div className="text-center py-8 text-gray-400">
                   <div className="text-4xl mb-2">⏰</div>
                   <p>Henüz focus aktivitesi yok</p>
                   <p className="text-sm mt-1">Timer'ı başlatarak ilk focus seansınızı başlatın</p>
                 </div>
               ) : (
                 <div className="space-y-2">
                   {focusEntries.slice(-10).reverse().map(entry => (
                     <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg group hover:bg-gray-700/50 transition-all">
                       <div className="flex items-center gap-3">
                         <span className="text-gray-100">{formatDate(entry.date)}</span>
                         {entry.time && <span className="text-gray-400 text-sm">{entry.time}</span>}
                         <span className={`px-2 py-1 rounded-full text-xs ${
                           entry.type === 'pomodoro' ? 'bg-blue-500/20 text-blue-400' : 
                           entry.type === 'focus' ? 'bg-green-500/20 text-green-400' :
                           'bg-gray-500/20 text-gray-400'
                         }`}>
                           {entry.type === 'pomodoro' ? 'Pomodoro' : 
                            entry.type === 'focus' ? 'Focus' :
                            entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                         </span>
                       </div>
                       <div className="flex items-center gap-3">
                         <span className="text-blue-400 font-semibold">{entry.minutes} dakika</span>
                         <button
                           onClick={(e) => {
                             e.preventDefault();
                             e.stopPropagation();
                             handleDeleteEntry(entry.id);
                           }}
                           className="opacity-50 group-hover:opacity-100 bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-200 p-2 rounded-lg transition-all duration-200 flex items-center justify-center min-w-[36px] min-h-[36px]"
                           title="Bu seansı sil"
                         >
                           <Trash2 size={16} />
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           )}

           {/* Şehir Sekmesi */}
           {activeTab === 'city' && (
             <div className="space-y-6">
               <div className="text-center">
                 <h3 className="font-semibold text-2xl text-gray-100 mb-2">🏙️ Focus Şehriniz</h3>
                 <p className="text-gray-400">Focus çalışmalarınızla şehrinizi büyütün!</p>
               </div>
               <CityBuilder focusEntries={focusEntries} />
             </div>
           )}
         </div>
       </div>

      {/* Şehir Görünümü */}
      {showCityView && (
        <div className="mt-6">
          <CityBuilder focusEntries={focusEntries} />
        </div>
      )}
    </div>
  );
};

export default FocusTimer;