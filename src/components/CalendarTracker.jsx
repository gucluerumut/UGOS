import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Calendar, Clock, Target, DollarSign, Dumbbell, BookOpen, Heart, CheckCircle, AlertCircle, Filter, Eye, EyeOff, Moon, Brain } from 'lucide-react';

const CalendarTracker = ({ 
  tasks, 
  habits, 
  goals, 
  finances, 
  physicalData, 
  workouts, 
  learningEntries, 
  healthData,
  calendarEvents,
  setCalendarEvents,
  focusEntries,
  sleepData,
  meditationData
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterTypes, setFilterTypes] = useState({
    events: true,
    tasks: true,
    habits: true,
    goals: true,
    finances: true,
    physical: true,
    learning: true,
    health: true,
    focus: true,
    sleep: true,
    meditation: true
  });
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    type: 'event',
    category: 'personal',
    priority: 'medium',
    reminder: false
  });

  const eventTypes = [
    { id: 'event', name: 'Etkinlik', icon: Calendar, color: 'blue' },
    { id: 'meeting', name: 'Toplantı', icon: Clock, color: 'purple' },
    { id: 'deadline', name: 'Son Tarih', icon: AlertCircle, color: 'red' },
    { id: 'reminder', name: 'Hatırlatma', icon: CheckCircle, color: 'green' }
  ];

  const categories = [
    { id: 'personal', name: 'Kişisel', color: 'blue' },
    { id: 'work', name: 'İş', color: 'purple' },
    { id: 'health', name: 'Sağlık', color: 'green' },
    { id: 'education', name: 'Eğitim', color: 'yellow' },
    { id: 'finance', name: 'Finans', color: 'red' },
    { id: 'social', name: 'Sosyal', color: 'pink' }
  ];

  const priorities = [
    { id: 'low', name: 'Düşük', color: 'gray' },
    { id: 'medium', name: 'Orta', color: 'yellow' },
    { id: 'high', name: 'Yüksek', color: 'red' }
  ];

  // Takvim hesaplamaları
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isSameDay = (date1, date2) => {
    return formatDate(date1) === formatDate(date2);
  };

  const isToday = (date) => {
    return isSameDay(date, new Date());
  };

  const isSelectedDay = (date) => {
    return isSameDay(date, selectedDate);
  };

  // Tüm veri kaynaklarından etkinlikleri topla
  const getAllEvents = (date) => {
    const dateStr = formatDate(date);
    const events = [];

    // Takvim etkinlikleri
    if (filterTypes.events) {
      const calendarEventsForDate = (calendarEvents || []).filter(event => 
        event.date === dateStr
      );
      events.push(...calendarEventsForDate.map(event => ({
        ...event,
        source: 'calendar',
        icon: Calendar,
        color: categories.find(c => c.id === event.category)?.color || 'blue'
      })));
    }

    // Görevler
    if (filterTypes.tasks) {
      const tasksForDate = (tasks || []).filter(task => 
        task.dueDate === dateStr
      );
      events.push(...tasksForDate.map(task => ({
        id: `task-${task.id}`,
        title: task.title,
        description: task.description,
        time: task.dueTime || '09:00',
        type: 'task',
        source: 'tasks',
        icon: CheckCircle,
        color: task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'yellow' : 'green',
        priority: task.priority,
        completed: task.completed
      })));
    }

    // Alışkanlıklar
    if (filterTypes.habits) {
      const habitsForDate = (habits || []).filter(habit => {
        // Alışkanlığın o tarihte tamamlanıp tamamlanmadığını kontrol et
        return habit.checks && habit.checks.some(check => check.date === dateStr);
      });
      events.push(...habitsForDate.map(habit => ({
        id: `habit-${habit.id}`,
        title: habit.name,
        description: `Tamamlandı - Streak: ${habit.streak || 0}`,
        time: '08:00',
        type: 'habit',
        source: 'habits',
        icon: Target,
        color: 'purple',
        streak: habit.streak || 0
      })));
    }

    // Hedefler (son tarih yaklaşanlar)
    if (filterTypes.goals) {
      const goalsForDate = (goals || []).filter(goal => 
        goal.deadline === dateStr
      );
      events.push(...goalsForDate.map(goal => ({
        id: `goal-${goal.id}`,
        title: `Hedef: ${goal.title}`,
        description: goal.description,
        time: '18:00',
        type: 'goal',
        source: 'goals',
        icon: Target,
        color: 'orange',
        progress: goal.currentValue && goal.targetValue ? 
                 Math.round((goal.currentValue / goal.targetValue) * 100) : 0
      })));
    }

    // Finansal işlemler
    if (filterTypes.finances) {
      const financesForDate = (finances?.transactions || []).filter(transaction => 
        transaction.date === dateStr
      );
      events.push(...financesForDate.map(transaction => ({
        id: `finance-${transaction.id}`,
        title: `${transaction.type === 'income' ? 'Gelir' : transaction.type === 'expense' ? 'Gider' : 'Yatırım'}`,
        description: `${transaction.description || 'Finansal işlem'} - ${transaction.amount} TL`,
        time: '12:00',
        type: 'finance',
        source: 'finances',
        icon: DollarSign,
        color: transaction.type === 'income' ? 'green' : transaction.type === 'expense' ? 'red' : 'purple',
        amount: transaction.amount
      })));
    }

    // Fiziksel aktiviteler
    if (filterTypes.physical) {
      const workoutsForDate = (workouts || []).filter(workout => 
        workout.date === dateStr
      );
      events.push(...workoutsForDate.map(workout => ({
        id: `workout-${workout.id}`,
        title: `Antrenman: ${workout.type}`,
        description: `${workout.duration} dk - ${workout.calories} kalori`,
        time: workout.time || '07:00',
        type: 'workout',
        source: 'physical',
        icon: Dumbbell,
        color: 'green',
        duration: workout.duration,
        calories: workout.calories
      })));
    }

    // Öğrenme aktiviteleri
    if (filterTypes.learning) {
      const learningForDate = (learningEntries || []).filter(entry => 
        entry.date === dateStr
      );
      events.push(...learningForDate.map(entry => ({
        id: `learning-${entry.id}`,
        title: `Öğrenme: ${entry.topic}`,
        description: `${entry.platform} - ${entry.duration} dk`,
        time: entry.time || '20:00',
        type: 'learning',
        source: 'learning',
        icon: BookOpen,
        color: 'blue',
        duration: entry.duration,
        platform: entry.platform
      })));
    }

    // Sağlık verileri
    if (filterTypes.health) {
      const healthForDate = (healthData || []).filter(data => 
        data.date === dateStr
      );
      events.push(...healthForDate.map(data => ({
        id: `health-${data.id}`,
        title: 'Sağlık Kaydı',
        description: `${data.type}: ${data.value} ${data.unit}`,
        time: data.time || '09:00',
        type: 'health',
        source: 'health',
        icon: Heart,
        color: 'red',
        value: data.value,
        unit: data.unit
      })));
    }

    // Focus verileri
    if (filterTypes.focus) {
      const focusForDate = (focusEntries || []).filter(entry => 
        entry.date === dateStr
      );
      events.push(...focusForDate.map(entry => ({
        id: `focus-${entry.id}`,
        title: `Focus: ${entry.type}`,
        description: `${entry.minutes} dakika`,
        time: entry.time || '10:00',
        type: 'focus',
        source: 'focus',
        icon: Clock,
        color: 'purple',
        duration: entry.minutes
      })));
    }

    // Uyku verileri
    if (filterTypes.sleep) {
      const sleepForDate = (sleepData || []).filter(entry => 
        entry.date === dateStr
      );
      events.push(...sleepForDate.map(entry => ({
        id: `sleep-${entry.id}`,
        title: 'Uyku',
        description: `${entry.duration} saat - Kalite: ${entry.quality}/10`,
        time: entry.bedtime || '23:00',
        type: 'sleep',
        source: 'sleep',
        icon: Moon,
        color: 'indigo',
        duration: entry.duration,
        quality: entry.quality
      })));
    }

    // Meditasyon verileri
    if (filterTypes.meditation) {
      const meditationForDate = (meditationData || []).filter(entry => 
        entry.date === dateStr
      );
      events.push(...meditationForDate.map(entry => ({
        id: `meditation-${entry.id}`,
        title: `Meditasyon: ${entry.type}`,
        description: `${entry.duration} dakika`,
        time: entry.time || '07:00',
        type: 'meditation',
        source: 'meditation',
        icon: Brain,
        color: 'teal',
        duration: entry.duration
      })));
    }

    // Zamanına göre sırala
    return events.sort((a, b) => {
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      return timeA.localeCompare(timeB);
    });
  };

  // Etkinlik ekleme
  const addEvent = () => {
    if (newEvent.title && newEvent.date) {
      const event = {
        id: Date.now(),
        ...newEvent,
        createdAt: new Date().toISOString()
      };
      setCalendarEvents(prev => [...(prev || []), event]);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: 60,
        type: 'event',
        category: 'personal',
        priority: 'medium',
        reminder: false
      });
      setShowEventModal(false);
    }
  };

  // Etkinlik silme
  const deleteEvent = (eventId) => {
    setCalendarEvents(prev => (prev || []).filter(event => event.id !== eventId));
    setSelectedEvent(null);
  };

  // Takvim navigasyonu
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const navigateWeek = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction * 7));
      return newDate;
    });
  };

  const navigateDay = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + direction);
      return newDate;
    });
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + direction);
      return newDate;
    });
  };

  // Ay görünümü render
  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Önceki ayın günleri
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-900/50"></div>);
    }

    // Bu ayın günleri
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const events = getAllEvents(date);
      const isCurrentDay = isToday(date);
      const isSelected = isSelectedDay(date);

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-24 p-1 border border-gray-700 cursor-pointer transition-colors ${
            isCurrentDay ? 'bg-blue-600/20 border-blue-500' : 
            isSelected ? 'bg-gray-600/50 border-gray-500' : 
            'hover:bg-gray-700/30'
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${
            isCurrentDay ? 'text-blue-400' : 'text-gray-300'
          }`}>
            {day}
          </div>
          <div className="space-y-1">
            {events.slice(0, 2).map((event, index) => (
              <div
                key={index}
                className={`text-xs p-1 rounded bg-${event.color}-500/20 text-${event.color}-300 truncate`}
              >
                {event.time} {event.title}
              </div>
            ))}
            {events.length > 2 && (
              <div className="text-xs text-gray-400">+{events.length - 2} daha</div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-0 border border-gray-700 rounded-lg overflow-hidden">
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
          <div key={day} className="bg-gray-800 p-2 text-center text-sm font-medium text-gray-300 border-b border-gray-700">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  // Hafta görünümü render
  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }

    return (
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((date, index) => {
          const events = getAllEvents(date);
          const isCurrentDay = isToday(date);
          const isSelected = isSelectedDay(date);

          return (
            <div key={index} className="space-y-2">
              <div
                onClick={() => setSelectedDate(date)}
                className={`text-center p-2 rounded-lg cursor-pointer transition-colors ${
                  isCurrentDay ? 'bg-blue-600 text-white' : 
                  isSelected ? 'bg-gray-600 text-gray-100' : 
                  'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="text-xs">{date.toLocaleDateString('tr-TR', { weekday: 'short' })}</div>
                <div className="text-lg font-bold">{date.getDate()}</div>
              </div>
              <div className="space-y-1 min-h-[300px]">
                {events.map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    onClick={() => setSelectedEvent(event)}
                    className={`p-2 rounded text-xs cursor-pointer bg-${event.color}-500/20 text-${event.color}-300 hover:bg-${event.color}-500/30 transition-colors`}
                  >
                    <div className="font-medium">{event.time}</div>
                    <div className="truncate">{event.title}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Gün görünümü render
  const renderDayView = () => {
    const events = getAllEvents(selectedDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-100">
            {selectedDate.toLocaleDateString('tr-TR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
          {hours.map(hour => {
            const hourStr = hour.toString().padStart(2, '0') + ':00';
            const hourEvents = events.filter(event => 
              event.time && event.time.startsWith(hour.toString().padStart(2, '0'))
            );

            return (
              <div key={hour} className="flex border-b border-gray-700 last:border-b-0">
                <div className="w-16 py-2 text-sm text-gray-400 text-right pr-4">
                  {hourStr}
                </div>
                <div className="flex-1 py-2 min-h-[40px]">
                  {hourEvents.map((event, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedEvent(event)}
                      className={`mb-1 p-2 rounded cursor-pointer bg-${event.color}-500/20 text-${event.color}-300 hover:bg-${event.color}-500/30 transition-colors`}
                    >
                      <div className="flex items-center gap-2">
                        <event.icon size={14} />
                        <span className="font-medium">{event.title}</span>
                      </div>
                      {event.description && (
                        <div className="text-xs mt-1 text-gray-400">{event.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Takvim</h2>
          <p className="text-gray-400">Tüm etkinliklerinizi tek yerden yönetin</p>
        </div>
        <button
          onClick={() => setShowEventModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Etkinlik Ekle
        </button>
      </div>

      {/* Navigation and View Controls */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (viewMode === 'month') navigateMonth(-1);
                else if (viewMode === 'week') navigateWeek(-1);
                else navigateDay(-1);
              }}
              className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            <h3 className="text-xl font-semibold text-gray-100 min-w-[200px] text-center">
              {viewMode === 'month' && currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
              {viewMode === 'week' && `${currentDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} Haftası`}
              {viewMode === 'day' && selectedDate.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            
            <button
              onClick={() => {
                if (viewMode === 'month') navigateMonth(1);
                else if (viewMode === 'week') navigateWeek(1);
                else navigateDay(1);
              }}
              className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <button
            onClick={() => {
              setCurrentDate(new Date());
              setSelectedDate(new Date());
            }}
            className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Bugün
          </button>
        </div>

        <div className="flex items-center gap-2">
          {['month', 'week', 'day'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                viewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {mode === 'month' ? 'Ay' : mode === 'week' ? 'Hafta' : 'Gün'}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} className="text-gray-400" />
          <span className="text-gray-300 font-medium">Filtreler</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(filterTypes).map(([key, enabled]) => {
            const labels = {
              events: 'Etkinlikler',
              tasks: 'Görevler',
              habits: 'Alışkanlıklar',
              goals: 'Hedefler',
              finances: 'Finans',
              physical: 'Fiziksel',
              learning: 'Öğrenme',
              health: 'Sağlık',
              focus: 'Focus',
              sleep: 'Uyku',
              meditation: 'Meditasyon'
            };
            
            return (
              <button
                key={key}
                onClick={() => setFilterTypes(prev => ({ ...prev, [key]: !prev[key] }))}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  enabled
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {labels[key]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendar Views */}
      <div className="bg-gray-900 p-6 rounded-lg">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>

      {/* Selected Date Events */}
      {viewMode !== 'day' && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-100 mb-4">
            {selectedDate.toLocaleDateString('tr-TR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })} - Etkinlikler
          </h3>
          
          <div className="space-y-3">
            {getAllEvents(selectedDate).map((event, index) => (
              <div
                key={index}
                onClick={() => setSelectedEvent(event)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer bg-${event.color}-500/10 border border-${event.color}-500/20 hover:bg-${event.color}-500/20 transition-colors`}
              >
                <event.icon size={20} className={`text-${event.color}-400`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-100">{event.title}</span>
                    <span className="text-sm text-gray-400">{event.time}</span>
                    <span className={`px-2 py-1 rounded-full text-xs bg-${event.color}-500/20 text-${event.color}-400`}>
                      {event.source}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
            
            {getAllEvents(selectedDate).length === 0 && (
              <p className="text-gray-400 text-center py-8">Bu tarihte etkinlik bulunmuyor</p>
            )}
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-100">Yeni Etkinlik</h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Başlık</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-gray-700 text-gray-100 px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Etkinlik başlığı"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Açıklama</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-gray-700 text-gray-100 px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Etkinlik açıklaması"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Tarih</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-gray-700 text-gray-100 px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Saat</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full bg-gray-700 text-gray-100 px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Tür</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-gray-700 text-gray-100 px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    {eventTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Kategori</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-gray-700 text-gray-100 px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={addEvent}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-100">Etkinlik Detayı</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <selectedEvent.icon size={24} className={`text-${selectedEvent.color}-400`} />
                <div>
                  <h4 className="text-lg font-medium text-gray-100">{selectedEvent.title}</h4>
                  <p className="text-sm text-gray-400">{selectedEvent.time}</p>
                </div>
              </div>

              {selectedEvent.description && (
                <div>
                  <h5 className="text-sm font-medium text-gray-300 mb-1">Açıklama</h5>
                  <p className="text-gray-400">{selectedEvent.description}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm bg-${selectedEvent.color}-500/20 text-${selectedEvent.color}-400`}>
                  {selectedEvent.source}
                </span>
                {selectedEvent.priority && (
                  <span className={`px-3 py-1 rounded-full text-sm bg-${selectedEvent.priority === 'high' ? 'red' : selectedEvent.priority === 'medium' ? 'yellow' : 'green'}-500/20 text-${selectedEvent.priority === 'high' ? 'red' : selectedEvent.priority === 'medium' ? 'yellow' : 'green'}-400`}>
                    {selectedEvent.priority === 'high' ? 'Yüksek' : selectedEvent.priority === 'medium' ? 'Orta' : 'Düşük'} Öncelik
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Kapat
                </button>
                {selectedEvent.source === 'calendar' && (
                  <button
                    onClick={() => deleteEvent(selectedEvent.id)}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Sil
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarTracker;