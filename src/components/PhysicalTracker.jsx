import React, { useState } from 'react';
import { Plus, X, Dumbbell, Scale, Ruler, Calendar, Clock, Target, TrendingUp, BarChart3, Activity, Zap, Award, Eye, EyeOff } from 'lucide-react';

const PhysicalTracker = ({ physicalData, setPhysicalData, workouts, setWorkouts }) => {
  const [newPhysicalNote, setNewPhysicalNote] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newMeasurement, setNewMeasurement] = useState({ type: 'waist', value: '', unit: 'cm' });
  const [newWorkout, setNewWorkout] = useState({ 
    type: '', 
    duration: '', 
    exercises: '', 
    intensity: 'medium',
    calories: '',
    notes: ''
  });
  const [activeTab, setActiveTab] = useState('overview'); // overview, weight, measurements, workouts
  const [showStats, setShowStats] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('30'); // 7, 30, 90 days
  const addPhysicalNote = () => {
    if (newPhysicalNote.trim()) {
      const note = {
        id: Date.now(),
        text: newPhysicalNote,
        date: new Date().toISOString().split('T')[0],
        type: 'note',
        timestamp: new Date().toISOString()
      };
      setPhysicalData(prev => [...prev, note]);
      setNewPhysicalNote('');
    }
  };

  const addWeight = () => {
    if (newWeight.trim()) {
      const weightEntry = {
        id: Date.now(),
        weight: parseFloat(newWeight),
        date: new Date().toISOString().split('T')[0],
        type: 'weight',
        timestamp: new Date().toISOString()
      };
      setPhysicalData(prev => [...prev, weightEntry]);
      setNewWeight('');
    }
  };

  const addMeasurement = () => {
    if (newMeasurement.value.trim()) {
      const measurementEntry = {
        id: Date.now(),
        measurementType: newMeasurement.type,
        value: parseFloat(newMeasurement.value),
        unit: newMeasurement.unit,
        date: new Date().toISOString().split('T')[0],
        type: 'measurement',
        timestamp: new Date().toISOString()
      };
      setPhysicalData(prev => [...prev, measurementEntry]);
      setNewMeasurement({ type: 'waist', value: '', unit: 'cm' });
    }
  };

  const addWorkout = () => {
    if (newWorkout.type && newWorkout.duration) {
      const workout = {
        id: Date.now(),
        ...newWorkout,
        date: new Date().toISOString().split('T')[0],
        duration: parseInt(newWorkout.duration),
        calories: newWorkout.calories ? parseInt(newWorkout.calories) : null,
        timestamp: new Date().toISOString()
      };
      setWorkouts(prev => [...prev, workout]);
      setNewWorkout({ 
        type: '', 
        duration: '', 
        exercises: '', 
        intensity: 'medium',
        calories: '',
        notes: ''
      });
    }
  };

  const deletePhysicalNote = (id) => {
    setPhysicalData(prev => prev.filter(item => item.id !== id));
  };

  const deleteWorkout = (id) => {
    setWorkouts(prev => prev.filter(workout => workout.id !== id));
  };

  // İstatistik hesaplamaları
  const getWeightData = () => {
    return (physicalData || [])
      .filter(item => item.type === 'weight')
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getMeasurementData = (type) => {
    return (physicalData || [])
      .filter(item => item.type === 'measurement' && item.measurementType === type)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getWorkoutStats = () => {
    const totalWorkouts = (workouts || []).length;
    const totalTime = (workouts || []).reduce((total, workout) => total + (workout.duration || 0), 0);
    const totalCalories = (workouts || []).reduce((total, workout) => total + (workout.calories || 0), 0);
    const avgDuration = totalWorkouts > 0 ? Math.round(totalTime / totalWorkouts) : 0;
    
    // Son 7 gün
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const recentWorkouts = workouts.filter(w => new Date(w.date) >= last7Days);
    
    // En popüler antrenman türü
    const workoutTypes = {};
    workouts.forEach(w => {
      workoutTypes[w.type] = (workoutTypes[w.type] || 0) + 1;
    });
    const mostPopularType = Object.keys(workoutTypes).reduce((a, b) => 
      workoutTypes[a] > workoutTypes[b] ? a : b, ''
    );

    return {
      totalWorkouts,
      totalTime,
      totalCalories,
      avgDuration,
      recentWorkouts: recentWorkouts.length,
      mostPopularType
    };
  };

  const getWeightProgress = () => {
    const weights = getWeightData();
    if (weights.length < 2) return { change: 0, trend: 'stable' };
    
    const latest = weights[weights.length - 1].weight;
    const previous = weights[weights.length - 2].weight;
    const change = latest - previous;
    
    return {
      change: Math.abs(change),
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      latest,
      previous
    };
  };

  const measurementTypes = [
    { id: 'waist', name: 'Bel', icon: '⭕' },
    { id: 'chest', name: 'Göğüs', icon: '💪' },
    { id: 'arm', name: 'Kol', icon: '💪' },
    { id: 'thigh', name: 'Bacak', icon: '🦵' },
    { id: 'neck', name: 'Boyun', icon: '👔' },
    { id: 'hip', name: 'Kalça', icon: '🍑' }
  ];

  const workoutIntensities = [
    { id: 'low', name: 'Düşük', color: 'green' },
    { id: 'medium', name: 'Orta', color: 'yellow' },
    { id: 'high', name: 'Yüksek', color: 'orange' },
    { id: 'extreme', name: 'Ekstrem', color: 'red' }
  ];

  const stats = getWorkoutStats();
  const weightProgress = getWeightProgress();

  const renderWeightChart = () => {
    const weights = getWeightData();
    if (weights.length === 0) return null;

    const maxWeight = Math.max(...weights.map(w => w.weight));
    const minWeight = Math.min(...weights.map(w => w.weight));
    const range = maxWeight - minWeight || 1;

    return (
      <div className="bg-gray-700/30 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-100 mb-4">Kilo Değişimi</h4>
        <div className="relative h-32">
          <svg className="w-full h-full">
            {weights.map((weight, index) => {
              const x = (index / (weights.length - 1 || 1)) * 100;
              const y = 100 - ((weight.weight - minWeight) / range) * 80;
              
              return (
                <g key={weight.id}>
                  <circle
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="4"
                    fill="#10b981"
                    className="hover:r-6 transition-all"
                  />
                  {index > 0 && (
                    <line
                      x1={`${((index - 1) / (weights.length - 1 || 1)) * 100}%`}
                      y1={`${100 - ((weights[index - 1].weight - minWeight) / range) * 80}%`}
                      x2={`${x}%`}
                      y2={`${y}%`}
                      stroke="#10b981"
                      strokeWidth="2"
                    />
                  )}
                </g>
              );
            })}
          </svg>
          <div className="absolute bottom-0 left-0 text-xs text-gray-400">
            {minWeight.toFixed(1)}kg
          </div>
          <div className="absolute top-0 left-0 text-xs text-gray-400">
            {maxWeight.toFixed(1)}kg
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-400 text-center">
          Son {weights.length} ölçüm
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Fiziksel Gelişim</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowStats(!showStats)}
            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-xl transition-all flex items-center gap-2"
          >
            {showStats ? <EyeOff size={20} /> : <Eye size={20} />}
            İstatistikler
          </button>
        </div>
      </div>

      {/* İstatistikler */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="text-green-400" size={20} />
              <span className="text-gray-100 font-medium">Antrenmanlar</span>
            </div>
            <div className="text-3xl font-bold text-green-400">{stats.totalWorkouts}</div>
            <div className="text-gray-400 text-sm">toplam</div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 rounded-xl border border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-blue-400" size={20} />
              <span className="text-gray-100 font-medium">Toplam Süre</span>
            </div>
            <div className="text-3xl font-bold text-blue-400">{Math.round(stats.totalTime / 60)}</div>
            <div className="text-gray-400 text-sm">saat</div>
          </div>

          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-4 rounded-xl border border-orange-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="text-orange-400" size={20} />
              <span className="text-gray-100 font-medium">Kalori</span>
            </div>
            <div className="text-3xl font-bold text-orange-400">{stats.totalCalories}</div>
            <div className="text-gray-400 text-sm">yakılan</div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-xl border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-purple-400" size={20} />
              <span className="text-gray-100 font-medium">Bu Hafta</span>
            </div>
            <div className="text-3xl font-bold text-purple-400">{stats.recentWorkouts}</div>
            <div className="text-gray-400 text-sm">antrenman</div>
          </div>
        </div>
      )}

      {/* Kilo İlerleme Kartı */}
      {weightProgress.latest && (
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 p-6 rounded-2xl border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Kilo Durumu</h3>
              <div className="text-3xl font-bold text-green-400">{weightProgress.latest}kg</div>
              <div className="text-sm text-gray-400">
                {weightProgress.trend === 'up' && `+${weightProgress.change.toFixed(1)}kg artış`}
                {weightProgress.trend === 'down' && `-${weightProgress.change.toFixed(1)}kg azalış`}
                {weightProgress.trend === 'stable' && 'Değişim yok'}
              </div>
            </div>
            <div className="text-right">
              <Scale className="text-green-400 mb-2" size={32} />
              <div className="text-sm text-gray-400">Son ölçüm</div>
            </div>
          </div>
        </div>
      )}

      {/* Sekmeler */}
      <div className="flex flex-wrap gap-2 bg-gray-800/50 p-2 rounded-xl">
        {[
          { id: 'overview', name: 'Genel Bakış', icon: BarChart3 },
          { id: 'weight', name: 'Kilo Takibi', icon: Scale },
          { id: 'measurements', name: 'Ölçüler', icon: Ruler },
          { id: 'workouts', name: 'Antrenmanlar', icon: Dumbbell }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id 
                ? 'bg-green-500 text-white' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Sekme İçerikleri */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kilo Grafiği */}
          {renderWeightChart()}
          
          {/* Son Antrenmanlar */}
          <div className="bg-gray-700/30 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-100 mb-4">Son Antrenmanlar</h4>
            <div className="space-y-3">
              {(workouts || []).slice(-5).reverse().map(workout => (
                <div key={workout.id} className="flex items-center justify-between bg-gray-600/30 p-3 rounded-lg">
                  <div>
                    <div className="text-gray-100 font-medium">{workout.type}</div>
                    <div className="text-gray-400 text-sm">{workout.duration} dk</div>
                  </div>
                  <div className="text-gray-400 text-sm">{workout.date}</div>
                </div>
              ))}
              {(workouts || []).length === 0 && (
                <p className="text-gray-400 text-center py-4">Henüz antrenman eklenmemiş</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'weight' && (
        <div className="space-y-6">
          {/* Kilo Ekleme */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-gray-100">
              <Scale className="text-green-400" />
              Kilo Ekle
            </h3>
            <div className="flex gap-3">
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Kilo (kg)"
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && addWeight()}
              />
              <button onClick={addWeight} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                Ekle
              </button>
            </div>
          </div>

          {/* Kilo Geçmişi */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <h3 className="font-semibold text-xl mb-4 text-gray-100">Kilo Geçmişi</h3>
            <div className="space-y-3">
              {getWeightData().reverse().map(item => (
                <div key={item.id} className="flex items-center justify-between bg-gray-700/50 p-4 rounded-lg">
                  <div>
                    <div className="text-gray-100 font-medium text-xl">{item.weight}kg</div>
                    <div className="text-gray-400 text-sm flex items-center gap-1">
                      <Calendar size={14} />
                      {item.date}
                    </div>
                  </div>
                  <button
                    onClick={() => deletePhysicalNote(item.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              {getWeightData().length === 0 && (
                <p className="text-gray-400 text-center py-4">Henüz kilo kaydı eklenmemiş</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'measurements' && (
        <div className="space-y-6">
          {/* Ölçü Ekleme */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-gray-100">
              <Ruler className="text-blue-400" />
              Ölçü Ekle
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={newMeasurement.type}
                onChange={(e) => setNewMeasurement(prev => ({ ...prev, type: e.target.value }))}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              >
                {measurementTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                ))}
              </select>
              <input
                type="number"
                step="0.1"
                value={newMeasurement.value}
                onChange={(e) => setNewMeasurement(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Değer"
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
              <select
                value={newMeasurement.unit}
                onChange={(e) => setNewMeasurement(prev => ({ ...prev, unit: e.target.value }))}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="cm">cm</option>
                <option value="inch">inch</option>
              </select>
            </div>
            <button 
              onClick={addMeasurement} 
              className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all w-full md:w-auto"
            >
              Ölçü Ekle
            </button>
          </div>

          {/* Ölçü Geçmişi */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <h3 className="font-semibold text-xl mb-4 text-gray-100">Ölçü Geçmişi</h3>
            <div className="space-y-3">
              {physicalData
                .filter(item => item.type === 'measurement')
                .reverse()
                .map(item => {
                  const measurementType = measurementTypes.find(t => t.id === item.measurementType);
                  return (
                    <div key={item.id} className="flex items-center justify-between bg-gray-700/50 p-4 rounded-lg">
                      <div>
                        <div className="text-gray-100 font-medium">
                          {measurementType?.icon} {measurementType?.name}: {item.value}{item.unit}
                        </div>
                        <div className="text-gray-400 text-sm flex items-center gap-1">
                          <Calendar size={14} />
                          {item.date}
                        </div>
                      </div>
                      <button
                        onClick={() => deletePhysicalNote(item.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  );
                })}
              {(physicalData || []).filter(item => item.type === 'measurement').length === 0 && (
                <p className="text-gray-400 text-center py-4">Henüz ölçü kaydı eklenmemiş</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'workouts' && (
        <div className="space-y-6">
          {/* Antrenman Ekleme */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-gray-100">
              <Dumbbell className="text-orange-400" />
              Antrenman Ekle
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <input
                type="text"
                value={newWorkout.type}
                onChange={(e) => setNewWorkout(prev => ({ ...prev, type: e.target.value }))}
                placeholder="Antrenman türü"
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
              />
              <input
                type="number"
                value={newWorkout.duration}
                onChange={(e) => setNewWorkout(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="Süre (dakika)"
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
              />
              <select
                value={newWorkout.intensity}
                onChange={(e) => setNewWorkout(prev => ({ ...prev, intensity: e.target.value }))}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
              >
                {workoutIntensities.map(intensity => (
                  <option key={intensity.id} value={intensity.id}>{intensity.name}</option>
                ))}
              </select>
              <input
                type="number"
                value={newWorkout.calories}
                onChange={(e) => setNewWorkout(prev => ({ ...prev, calories: e.target.value }))}
                placeholder="Kalori (opsiyonel)"
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
              />
              <input
                type="text"
                value={newWorkout.exercises}
                onChange={(e) => setNewWorkout(prev => ({ ...prev, exercises: e.target.value }))}
                placeholder="Egzersizler"
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
              />
              <input
                type="text"
                value={newWorkout.notes}
                onChange={(e) => setNewWorkout(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notlar"
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <button 
              onClick={addWorkout} 
              className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all w-full md:w-auto"
            >
              Antrenman Ekle
            </button>
          </div>

          {/* Antrenman Geçmişi */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
            <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-gray-100">
              <Activity className="text-orange-400" />
              Antrenman Geçmişi
            </h3>
            <div className="space-y-4">
              {(workouts || []).length === 0 ? (
                <p className="text-gray-400 text-center py-4">Henüz antrenman eklenmemiş</p>
              ) : (
                (workouts || []).reverse().map(workout => {
                  const intensity = workoutIntensities.find(i => i.id === workout.intensity);
                  return (
                    <div key={workout.id} className="bg-gray-700/50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h4 className="text-gray-100 font-medium text-lg">{workout.type}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${intensity?.color}-500/20 text-${intensity?.color}-400`}>
                            {intensity?.name}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteWorkout(workout.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Clock size={14} />
                          {workout.duration} dakika
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Calendar size={14} />
                          {workout.date}
                        </div>
                        {workout.calories && (
                          <div className="flex items-center gap-1 text-gray-400">
                            <Zap size={14} />
                            {workout.calories} kalori
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-gray-400">
                          <Target size={14} />
                          {intensity?.name} yoğunluk
                        </div>
                      </div>
                      
                      {workout.exercises && (
                        <div className="mt-2 text-gray-300">
                          <strong>Egzersizler:</strong> {workout.exercises}
                        </div>
                      )}
                      
                      {workout.notes && (
                        <div className="mt-2 text-gray-400">
                          <strong>Notlar:</strong> {workout.notes}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Genel Notlar (tüm sekmelerde görünür) */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl">
        <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-gray-100">
          <Plus className="text-gray-400" />
          Genel Notlar
        </h3>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={newPhysicalNote}
            onChange={(e) => setNewPhysicalNote(e.target.value)}
            placeholder="Genel fiziksel not ekle..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-gray-500 focus:outline-none"
            onKeyPress={(e) => e.key === 'Enter' && addPhysicalNote()}
          />
          <button onClick={addPhysicalNote} className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-all">
            Ekle
          </button>
        </div>
        
        <div className="space-y-3">
          {physicalData
            .filter(item => item.type === 'note')
            .reverse()
            .map(item => (
              <div key={item.id} className="flex items-center justify-between bg-gray-700/50 p-4 rounded-lg">
                <div>
                  <div className="text-gray-100 font-medium">{item.text}</div>
                  <div className="text-gray-400 text-sm flex items-center gap-1">
                    <Calendar size={14} />
                    {item.date}
                  </div>
                </div>
                <button
                  onClick={() => deletePhysicalNote(item.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          {(physicalData || []).filter(item => item.type === 'note').length === 0 && (
            <p className="text-gray-400 text-center py-4">Henüz genel not eklenmemiş</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default PhysicalTracker;