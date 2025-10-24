import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Clock, ListTodo, Target, Activity, Heart, BookOpen, BarChart3, Trophy, DollarSign, Calendar, Brain, Moon, Book, Award, Loader2 } from 'lucide-react';
import { useOptimizedStorage, useBatchedStorage, useStorageQuota } from './hooks/useOptimizedStorage';
import { cacheUtils } from './utils/cache';
import { UndoRedoProvider } from './contexts/UndoRedoContext';

// Lazy loaded components
const Dashboard = lazy(() => import('./components/Dashboard'));
const FocusTimer = lazy(() => import('./components/FocusTimer'));
const TaskManager = lazy(() => import('./components/TaskManager'));
const HabitTracker = lazy(() => import('./components/HabitTracker'));
const PhysicalTracker = lazy(() => import('./components/PhysicalTracker'));
const HealthTracker = lazy(() => import('./components/HealthTracker'));
const LearningTracker = lazy(() => import('./components/LearningTracker'));
const GoalsTracker = lazy(() => import('./components/GoalsTracker'));
const FinanceTracker = lazy(() => import('./components/FinanceTracker'));
const CalendarTracker = lazy(() => import('./components/CalendarTracker'));
const MeditationTracker = lazy(() => import('./components/MeditationTracker'));
const SleepTracker = lazy(() => import('./components/SleepTracker'));
const BookReadingTracker = lazy(() => import('./components/BookReadingTracker'));
const AchievementSystem = lazy(() => import('./components/AchievementSystem'));

const PersonalTrackerApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  // PIN gate state
  const REQUIRED_PIN = '241064';
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    const verified = localStorage.getItem('ugos-pin-verified');
    if (verified === '1') {
      setIsUnlocked(true);
    }
  }, []);

  const handlePinSubmit = () => {
    if (pinInput.trim() === REQUIRED_PIN) {
      localStorage.setItem('ugos-pin-verified', '1');
      setIsUnlocked(true);
      setPinError('');
    } else {
      setPinError('PIN hatalı, lütfen tekrar deneyin');
    }
  };
  // Storage optimization hooks
  const { quota, cleanupOldData } = useStorageQuota();
  const { addToBatch, flushBatch } = useBatchedStorage();
  
  // Focus Timer State - optimized storage
  const [focusTime, setFocusTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [focusEntries, setFocusEntries] = useOptimizedStorage('ugos-focus-entries', [], {
    debounceMs: 1000,
    enableCache: true,
    ttl: 60 * 60 * 1000 // 1 hour cache
  });
  const [manualMinutes, setManualMinutes] = useState('');

  // Tasks State - optimized storage
  const [tasks, setTasks] = useOptimizedStorage('ugos-tasks', [], {
    debounceMs: 500,
    enableCache: true,
    ttl: 30 * 60 * 1000 // 30 minutes cache
  });
  const [newTask, setNewTask] = useState({ text: '', category: 'daily' });

  // Habits State - optimized storage
  const [habits, setHabits] = useOptimizedStorage('ugos-habits', [], {
    debounceMs: 1000,
    enableCache: true,
    ttl: 60 * 60 * 1000 // 1 hour cache
  });
  const [newHabit, setNewHabit] = useState('');

  // Physical State - optimized storage
  const [physicalNotes, setPhysicalNotes] = useOptimizedStorage('ugos-physical-notes', [], {
    debounceMs: 1000,
    enableCache: true
  });
  const [workouts, setWorkouts] = useOptimizedStorage('ugos-workouts', [], {
    debounceMs: 1000,
    enableCache: true
  });

  // Health State - optimized storage
  const [healthData, setHealthData] = useOptimizedStorage('ugos-health-data', [], {
    debounceMs: 1000,
    enableCache: true
  });
  const [newHealthData, setNewHealthData] = useState({ date: '', type: '', value: '', notes: '' });

  // Learning State - optimized storage
  const [learningEntries, setLearningEntries] = useOptimizedStorage('ugos-learning-entries', [], {
    debounceMs: 1000,
    enableCache: true
  });
  const [newLearning, setNewLearning] = useState({ topic: '', platform: '', minutes: '', date: '' });

  // Goals State - optimized storage
  const [goals, setGoals] = useOptimizedStorage('ugos-goals', [], {
    debounceMs: 1000,
    enableCache: true
  });

  // Finance State - optimized storage
  const [transactions, setTransactions] = useOptimizedStorage('ugos-transactions', [], {
    debounceMs: 1000,
    enableCache: true
  });
  const [budgets, setBudgets] = useOptimizedStorage('ugos-budgets', [], {
    debounceMs: 1000,
    enableCache: true
  });

  // Calendar State - optimized storage
  const [calendarEvents, setCalendarEvents] = useOptimizedStorage('ugos-calendar-events', [], {
    debounceMs: 1000,
    enableCache: true
  });

  // Meditation State - optimized storage
  const [meditationData, setMeditationData] = useOptimizedStorage('ugos-meditation-data', [], {
    debounceMs: 1000,
    enableCache: true
  });

  // Sleep State - optimized storage
  const [sleepData, setSleepData] = useOptimizedStorage('ugos-sleep-data', [], {
    debounceMs: 1000,
    enableCache: true
  });

  // Book Reading State - optimized storage
  const [bookData, setBookData] = useOptimizedStorage('ugos-book-data', [], {
    debounceMs: 1000,
    enableCache: true
  });

  // Storage optimization effects
  useEffect(() => {
    // Clean up old data if storage quota is high
    if (quota.percentage > 80) {
      const cleanedCount = cleanupOldData();
      console.log(`Cleaned up ${cleanedCount} old storage entries`);
    }
  }, [quota.percentage, cleanupOldData]);

  // Preload frequently accessed data
  useEffect(() => {
    cacheUtils.preload('dashboard-stats', () => ({
      totalFocusTime: focusEntries.reduce((sum, entry) => sum + (entry.minutes || 0), 0),
      completedTasks: tasks.filter(task => task.completed).length,
      activeHabits: habits.filter(habit => habit.active).length,
      totalWorkouts: workouts.length
    }));
  }, [focusEntries, tasks, habits, workouts]);

  // Export/Import functions
  // Utility: ensure a persistent deviceId for cloud backups
  function getDeviceId() {
    const key = 'ugos-device-id';
    let id = localStorage.getItem(key);
    if (!id) {
      // Simple random ID; can be replaced with uuid later
      id = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(key, id);
    }
    return id;
  }

  // Tarihe göre filtreli export
  const exportData = () => {
    const data = {
      focusEntries,
      tasks,
      habits,
      physicalNotes,
      workouts,
      healthData,
      learningEntries,
      goals,
      transactions,
      budgets,
      calendarEvents,
      meditationData,
      sleepData,
      bookData,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ugos-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Bulut yedek için tüm verileri obje olarak topla
  const collectAllData = () => ({
    focusEntries,
    tasks,
    habits,
    physicalNotes,
    workouts,
    healthData,
    learningEntries,
    goals,
    transactions,
    budgets,
    calendarEvents,
    meditationData,
    sleepData,
    bookData,
    exportDate: new Date().toISOString()
  });

  // JSON obje ile içe aktarımı uygula (dosyasız kullanım için)
  const applyImportedData = (data) => {
    if (data.focusEntries) setFocusEntries(data.focusEntries);
    if (data.tasks) setTasks(data.tasks);
    if (data.habits) setHabits(data.habits);
    if (data.physicalNotes) setPhysicalNotes(data.physicalNotes);
    if (data.workouts) setWorkouts(data.workouts);
    if (data.healthData) setHealthData(data.healthData);
    if (data.learningEntries) setLearningEntries(data.learningEntries);
    if (data.goals) setGoals(data.goals);
    if (data.transactions) setTransactions(data.transactions);
    if (data.budgets) setBudgets(data.budgets);
    if (data.calendarEvents) setCalendarEvents(data.calendarEvents);
    if (data.meditationData) setMeditationData(data.meditationData);
    if (data.sleepData) setSleepData(data.sleepData);
    if (data.bookData) setBookData(data.bookData);
    alert('Veriler başarıyla içe aktarıldı!');
  };

  // Belirli bir tarihe göre export
  const exportDataByDate = (dateStr) => {
    if (!dateStr) {
      alert('Lütfen bir tarih seçin');
      return;
    }

    const safeFilter = (arr, field = 'date') => (arr || []).filter(item => item && item[field] === dateStr);
    const filterHabits = (arr) => (arr || [])
      .map(h => ({
        ...h,
        checks: (h.checks || []).filter(ch => ch.date === dateStr)
      }))
      .filter(h => (h.checks || []).length > 0);

    const data = {
      focusEntries: safeFilter(focusEntries, 'date'),
      tasks: (tasks || []).filter(t => t && t.dueDate === dateStr),
      habits: filterHabits(habits),
      physicalNotes: safeFilter(physicalNotes, 'date'),
      workouts: safeFilter(workouts, 'date'),
      healthData: safeFilter(healthData, 'date'),
      learningEntries: safeFilter(learningEntries, 'date'),
      goals: (goals || []).filter(g => g && g.createdAt && g.createdAt.split('T')[0] === dateStr),
      transactions: safeFilter(transactions, 'date'),
      budgets: (budgets || []).filter(b => b && (b.date === dateStr || b.period === dateStr)),
      calendarEvents: safeFilter(calendarEvents, 'date'),
      meditationData: safeFilter(meditationData, 'date'),
      sleepData: safeFilter(sleepData, 'date'),
      bookData: (bookData || []).filter(b => b && (b.addedDate === dateStr || b.completedDate === dateStr)),
      exportDate: new Date().toISOString(),
      filter: { type: 'single-day', date: dateStr }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ugos-backup-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Tarih aralığına göre export (başlangıç-bitiş dahil)
  const exportDataByRange = (startDateStr, endDateStr) => {
    if (!startDateStr || !endDateStr) {
      alert('Lütfen başlangıç ve bitiş tarihlerini seçin');
      return;
    }
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (start > end) {
      alert('Başlangıç tarihi, bitiş tarihinden büyük olamaz');
      return;
    }

    const inRange = (d) => {
      if (!d) return false;
      const dateObj = new Date(d);
      // normalize to 00:00 for start and 23:59 for end
      const s = new Date(start);
      s.setHours(0,0,0,0);
      const e = new Date(end);
      e.setHours(23,59,59,999);
      return dateObj >= s && dateObj <= e;
    };

    const filterListByDate = (list, field = 'date') => (list || []).filter(item => inRange(item?.[field]));
    const filterHabitsByRange = (arr) => (arr || [])
      .map(h => ({
        ...h,
        checks: (h.checks || []).filter(ch => inRange(ch.date))
      }))
      .filter(h => (h.checks || []).length > 0);

    const data = {
      focusEntries: filterListByDate(focusEntries, 'date'),
      tasks: (tasks || []).filter(t => inRange(t?.dueDate)),
      habits: filterHabitsByRange(habits),
      physicalNotes: filterListByDate(physicalNotes, 'date'),
      workouts: filterListByDate(workouts, 'date'),
      healthData: filterListByDate(healthData, 'date'),
      learningEntries: filterListByDate(learningEntries, 'date'),
      goals: (goals || []).filter(g => inRange(g?.createdAt?.split('T')[0])),
      transactions: filterListByDate(transactions, 'date'),
      budgets: (budgets || []).filter(b => inRange(b?.date)),
      calendarEvents: filterListByDate(calendarEvents, 'date'),
      meditationData: filterListByDate(meditationData, 'date'),
      sleepData: filterListByDate(sleepData, 'date'),
      bookData: (bookData || []).filter(b => inRange(b?.addedDate) || inRange(b?.completedDate)),
      exportDate: new Date().toISOString(),
      filter: { type: 'date-range', startDate: startDateStr, endDate: endDateStr }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ugos-backup-${startDateStr}_to_${endDateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          applyImportedData(data);
        } catch (error) {
          alert('Dosya okuma hatası!');
        }
      };
      reader.readAsText(file);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'focus', label: 'Focus', icon: Clock },
    { id: 'tasks', label: 'Görevler', icon: ListTodo },
    { id: 'habits', label: 'Alışkanlıklar', icon: Target },
    { id: 'physical', label: 'Fiziksel', icon: Activity },
    { id: 'health', label: 'Sağlık', icon: Heart },
    { id: 'learning', label: 'Öğrenme', icon: BookOpen },
    { id: 'goals', label: 'Hedefler', icon: Trophy },
    { id: 'achievements', label: 'Başarılar', icon: Award },
    { id: 'finance', label: 'Finans', icon: DollarSign },
    { id: 'calendar', label: 'Takvim', icon: Calendar },
    { id: 'meditation', label: 'Meditasyon', icon: Brain },
    { id: 'sleep', label: 'Uyku', icon: Moon },
    { id: 'books', label: 'Kitaplar', icon: Book },
  ];

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    // Geçici çözüm: Environment variable yüklenmiyor, doğrudan true yapıyoruz
    const cloudEnabled = true; // import.meta?.env?.VITE_CLOUD_ENABLED === 'true';
    console.log('cloudEnabled (forced):', cloudEnabled);
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            focusEntries={focusEntries}
            tasks={tasks}
            habits={habits}
            workouts={workouts}
            learningEntries={learningEntries}
            goals={goals}
            transactions={transactions}
            meditationData={meditationData}
            sleepData={sleepData}
            bookData={bookData}
            exportData={exportData}
            importData={importData}
            exportDataByDate={exportDataByDate}
            exportDataByRange={exportDataByRange}
            onCloudBackup={cloudEnabled ? () => cloudBackup(collectAllData, getDeviceId()) : undefined}
            onCloudRestoreLatest={cloudEnabled ? () => cloudRestoreLatest(applyImportedData, getDeviceId()) : undefined}
          />
        );
      case 'focus':
        return (
          <FocusTimer
            focusTime={focusTime}
            setFocusTime={setFocusTime}
            isRunning={isRunning}
            setIsRunning={setIsRunning}
            focusEntries={focusEntries}
            setFocusEntries={setFocusEntries}
            manualMinutes={manualMinutes}
            setManualMinutes={setManualMinutes}
          />
        );
      case 'tasks':
        return (
          <TaskManager
            tasks={tasks}
            setTasks={setTasks}
          />
        );
      case 'habits':
        return (
          <HabitTracker
            habits={habits}
            setHabits={setHabits}
            newHabit={newHabit}
            setNewHabit={setNewHabit}
          />
        );
      case 'physical':
        return (
          <PhysicalTracker
            physicalData={physicalNotes}
            setPhysicalData={setPhysicalNotes}
            workouts={workouts}
            setWorkouts={setWorkouts}
          />
        );
      case 'health':
        return (
          <HealthTracker
            healthData={healthData}
            setHealthData={setHealthData}
            newHealthData={newHealthData}
            setNewHealthData={setNewHealthData}
          />
        );
      case 'learning':
        return (
          <LearningTracker
            learningEntries={learningEntries}
            setLearningEntries={setLearningEntries}
            newLearning={newLearning}
            setNewLearning={setNewLearning}
          />
        );
      case 'goals':
        return (
          <GoalsTracker
            goals={goals}
            setGoals={setGoals}
          />
        );
      case 'achievements':
        return (
          <AchievementSystem
            userData={{
              booksRead: bookData?.length || 0,
              workoutsCompleted: workouts?.length || 0,
              meditationMinutes: meditationData?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0,
              focusHours: focusEntries?.reduce((sum, entry) => sum + (entry.minutes || 0), 0) / 60 || 0
            }}
            goals={goals}
            habits={habits}
            tasks={tasks}
          />
        );
      case 'finance':
        return (
          <FinanceTracker
            transactions={transactions}
            setTransactions={setTransactions}
            budgets={budgets}
            setBudgets={setBudgets}
          />
        );
      case 'calendar':
        return (
          <CalendarTracker
            calendarEvents={calendarEvents}
            setCalendarEvents={setCalendarEvents}
            tasks={tasks}
            habits={habits}
            goals={goals}
            transactions={transactions}
            physicalData={physicalNotes}
            workouts={workouts}
            learningEntries={learningEntries}
            healthData={healthData}
            focusEntries={focusEntries}
            sleepData={sleepData}
            meditationData={meditationData}
          />
        );
      case 'meditation':
        return (
          <MeditationTracker
            meditationData={meditationData}
            setMeditationData={setMeditationData}
          />
        );
      case 'sleep':
        return (
          <SleepTracker
            sleepData={sleepData}
            setSleepData={setSleepData}
          />
        );
      case 'books':
        return (
          <BookReadingTracker
            bookData={bookData}
            setBookData={setBookData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <UndoRedoProvider>
      {!isUnlocked ? (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 w-80">
              <h2 className="text-white font-bold text-lg mb-2">PIN Girişi</h2>
              <p className="text-gray-400 text-sm mb-4">Uygulamayı açmak için PIN girin</p>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handlePinSubmit(); }}
                className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="PIN"
              />
              {pinError && <div className="text-red-400 text-sm mt-2">{pinError}</div>}
              <button
                onClick={handlePinSubmit}
                className="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:from-purple-600 hover:to-pink-600"
              >
                Giriş
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="container mx-auto px-2 sm:px-4 py-4 max-w-7xl">
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-2xl shadow-2xl mb-6 p-4 sm:p-6 border border-purple-500/30">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-2">
              Kişisel Gelişim Takip Sistemi
            </h1>
            <p className="text-gray-300 text-sm sm:text-base">Hedeflerinizi takip edin, gelişiminizi ölçün</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl mb-6 p-3 border border-gray-700/50">
            <div className="overflow-x-auto no-scrollbar">
              <div className="flex gap-2 justify-start whitespace-nowrap pr-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                      }`}
                    >
                      <Icon size={16} className="sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-3 sm:p-6 border border-gray-700/50">
            <Suspense fallback={<LoadingSpinner />}>
              {renderActiveTab()}
            </Suspense>
          </div>
        </div>
        </div>
      )}
     </UndoRedoProvider>
   );
};

export default PersonalTrackerApp;

// Cloud backup: upload current data JSON to S3 via presigned URL
async function cloudBackup(collectAllDataFn, deviceId) {
  try {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const key = `backups/${deviceId}/${ts}.json`;

    const allData = collectAllDataFn ? collectAllDataFn() : null;
    const payload = allData || {};
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });

    const presignResp = await fetch(`/api/presign?op=put&key=${encodeURIComponent(key)}&contentType=${encodeURIComponent('application/json')}`);
    if (!presignResp.ok) throw new Error('Presign PUT failed');
    const { url } = await presignResp.json();

    const putResp = await fetch(url, { method: 'PUT', body: blob, headers: { 'Content-Type': 'application/json' } });
    if (!putResp.ok) throw new Error('Upload failed');
    alert('Bulut yedekleme tamamlandı.');
  } catch (e) {
    console.error(e);
    alert('Bulut yedekleme başarısız: ' + e.message);
  }
}

// Cloud restore: fetch latest backup under deviceId and import
async function cloudRestoreLatest(applyImportedDataFn, deviceId) {
  try {
    const listResp = await fetch(`/api/list?deviceId=${encodeURIComponent(deviceId)}`);
    if (!listResp.ok) throw new Error('Listeleme başarısız');
    const { items } = await listResp.json();
    if (!items || items.length === 0) {
      alert('Bulutta yedek bulunamadı.');
      return;
    }
    const latest = items[0];

    const presignGet = await fetch(`/api/presign?op=get&key=${encodeURIComponent(latest.key)}`);
    if (!presignGet.ok) throw new Error('Presign GET failed');
    const { url } = await presignGet.json();

    const dataResp = await fetch(url);
    if (!dataResp.ok) throw new Error('Yedek indirme başarısız');
    const json = await dataResp.json();

    if (applyImportedDataFn) {
      applyImportedDataFn(json);
    }
    alert('Bulut geri yükleme tamamlandı.');
  } catch (e) {
    console.error(e);
    alert('Bulut geri yükleme başarısız: ' + e.message);
  }
}