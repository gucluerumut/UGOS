import React, { useState, useMemo } from 'react';
import { Trash2, TrendingUp, TrendingDown, Activity, Heart, Droplets, Moon, Footprints, BarChart3, Calendar, Target } from 'lucide-react';

const HealthTracker = ({ healthData, setHealthData, newHealthData, setNewHealthData }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('list');

  const handleAddHealthData = () => {
    if (newHealthData.date && newHealthData.type) {
      setHealthData([...healthData, { ...newHealthData, id: Date.now() }]);
      setNewHealthData({ date: '', type: '', value: '', notes: '' });
    }
  };

  const deleteHealthData = (dataId) => {
    setHealthData(healthData.filter(h => h.id !== dataId));
  };

  const healthTypeLabels = {
    tansiyon: 'Tansiyon',
    nabız: 'Nabız',
    uyku: 'Uyku',
    su: 'Su Tüketimi',
    adım: 'Adım',
    diğer: 'Diğer'
  };

  const healthTypeIcons = {
    tansiyon: Heart,
    nabız: Activity,
    uyku: Moon,
    su: Droplets,
    adım: Footprints,
    diğer: BarChart3
  };

  const getHealthTypeColor = (type) => {
    const colors = {
      tansiyon: 'from-red-500 to-pink-500',
      nabız: 'from-pink-500 to-rose-500',
      uyku: 'from-blue-500 to-indigo-500',
      su: 'from-cyan-500 to-blue-500',
      adım: 'from-green-500 to-emerald-500',
      diğer: 'from-gray-500 to-slate-500'
    };
    return colors[type] || colors.diğer;
  };

  // Calculate statistics
  const healthStats = useMemo(() => {
    const stats = {};
    const typeGroups = healthData.reduce((acc, data) => {
      if (!acc[data.type]) acc[data.type] = [];
      acc[data.type].push(data);
      return acc;
    }, {});

    Object.keys(typeGroups).forEach(type => {
      const entries = typeGroups[type].sort((a, b) => new Date(a.date) - new Date(b.date));
      const numericValues = entries.map(e => {
        if (type === 'tansiyon') {
          const match = e.value.match(/(\d+)/);
          return match ? parseInt(match[1]) : 0;
        } else if (type === 'uyku') {
          const match = e.value.match(/(\d+)/);
          return match ? parseInt(match[1]) : 0;
        } else if (type === 'su') {
          const match = e.value.match(/(\d+)/);
          return match ? parseInt(match[1]) : 0;
        } else if (type === 'adım') {
          const match = e.value.match(/(\d+)/);
          return match ? parseInt(match[1]) : 0;
        } else if (type === 'nabız') {
          const match = e.value.match(/(\d+)/);
          return match ? parseInt(match[1]) : 0;
        }
        return 0;
      }).filter(v => v > 0);

      if (numericValues.length > 0) {
        const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
        const trend = numericValues.length > 1 ? 
          (numericValues[numericValues.length - 1] - numericValues[0]) / numericValues[0] * 100 : 0;
        
        stats[type] = {
          count: entries.length,
          average: avg,
          trend: trend,
          latest: numericValues[numericValues.length - 1],
          entries: entries
        };
      }
    });

    return stats;
  }, [healthData]);

  // Get filtered data
  const filteredData = useMemo(() => {
    if (selectedType === 'all') return healthData;
    return healthData.filter(data => data.type === selectedType);
  }, [healthData, selectedType]);

  // Generate chart data for trends
  const generateChartData = (type) => {
    const typeData = healthData.filter(d => d.type === type).sort((a, b) => new Date(a.date) - new Date(b.date));
    return typeData.map(d => {
      let value = 0;
      if (type === 'tansiyon') {
        const match = d.value.match(/(\d+)/);
        value = match ? parseInt(match[1]) : 0;
      } else if (type === 'uyku') {
        const match = d.value.match(/(\d+)/);
        value = match ? parseInt(match[1]) : 0;
      } else if (type === 'su') {
        const match = d.value.match(/(\d+)/);
        value = match ? parseInt(match[1]) : 0;
      } else if (type === 'adım') {
        const match = d.value.match(/(\d+)/);
        value = match ? parseInt(match[1]) : 0;
      } else if (type === 'nabız') {
        const match = d.value.match(/(\d+)/);
        value = match ? parseInt(match[1]) : 0;
      }
      return { date: d.date, value, original: d.value };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
          Sağlık Verileri
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'overview' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Genel Bakış
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'trends' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Trendler
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'add' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Veri Ekle
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(healthStats).map(([type, stats]) => {
              const IconComponent = healthTypeIcons[type];
              return (
                <div key={type} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${getHealthTypeColor(type)}`}>
                      <IconComponent size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-100">{healthTypeLabels[type]}</h3>
                      <p className="text-sm text-gray-400">{stats.count} kayıt</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ortalama:</span>
                      <span className="text-gray-100 font-medium">{stats.average.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Son:</span>
                      <span className="text-gray-100 font-medium">{stats.latest}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Trend:</span>
                      <div className="flex items-center gap-1">
                        {stats.trend > 0 ? (
                          <TrendingUp size={16} className="text-green-400" />
                        ) : stats.trend < 0 ? (
                          <TrendingDown size={16} className="text-red-400" />
                        ) : (
                          <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                        )}
                        <span className={`text-sm font-medium ${
                          stats.trend > 0 ? 'text-green-400' : 
                          stats.trend < 0 ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {Math.abs(stats.trend).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filter and View Controls */}
          <div className="flex gap-4 items-center">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-red-500 focus:outline-none"
            >
              <option value="all">Tüm Veriler</option>
              {Object.keys(healthTypeLabels).map(type => (
                <option key={type} value={type}>{healthTypeLabels[type]}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                Liste
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                Kart
              </button>
            </div>
          </div>

          {/* Health Data Display */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-gray-400 col-span-full">
                <div className="text-4xl mb-2">❤️</div>
                <p>
                  {selectedType === 'all' ? 'Henüz sağlık verisi yok' : `${healthTypeLabels[selectedType]} verisi bulunamadı`}
                </p>
              </div>
            ) : (
              filteredData.map(data => {
                const IconComponent = healthTypeIcons[data.type];
                return (
                  <div key={data.id} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 hover:border-red-500/50 transition-all animate-slide-up">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <IconComponent size={18} className="text-red-400" />
                          <span className="font-semibold text-red-400">{data.date}</span>
                          <span className={`bg-gradient-to-r ${getHealthTypeColor(data.type)} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                            {healthTypeLabels[data.type]}
                          </span>
                        </div>
                        <p className="font-bold text-lg text-gray-100 mb-1">{data.value}</p>
                        {data.notes && (
                          <p className="text-gray-400 text-sm bg-gray-700/30 p-2 rounded-lg">
                            {data.notes}
                          </p>
                        )}
                      </div>
                      <button 
                        onClick={() => deleteHealthData(data.id)} 
                        className="text-red-400 hover:text-red-300 hover:scale-110 transition-all ml-3"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-100">Sağlık Trendleri</h3>
          {Object.keys(healthStats).length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
              <p>Trend analizi için daha fazla veri gerekli</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(healthStats).map(([type, stats]) => {
                const chartData = generateChartData(type);
                const IconComponent = healthTypeIcons[type];
                
                if (chartData.length < 2) return null;
                
                const maxValue = Math.max(...chartData.map(d => d.value));
                const minValue = Math.min(...chartData.map(d => d.value));
                
                return (
                  <div key={type} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${getHealthTypeColor(type)}`}>
                        <IconComponent size={20} className="text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-100">{healthTypeLabels[type]} Trendi</h4>
                    </div>
                    
                    {/* Simple Chart */}
                    <div className="relative h-32 mb-4">
                      <div className="absolute inset-0 flex items-end justify-between gap-1">
                        {chartData.map((point, index) => {
                          const height = ((point.value - minValue) / (maxValue - minValue)) * 100;
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center">
                              <div 
                                className={`w-full bg-gradient-to-t ${getHealthTypeColor(type)} rounded-t transition-all hover:opacity-80`}
                                style={{ height: `${height}%` }}
                                title={`${point.date}: ${point.original}`}
                              ></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-400">Min</p>
                        <p className="font-semibold text-gray-100">{minValue}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400">Ort</p>
                        <p className="font-semibold text-gray-100">{stats.average.toFixed(1)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400">Max</p>
                        <p className="font-semibold text-gray-100">{maxValue}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'add' && (
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 shadow-xl">
          <h3 className="font-semibold text-xl mb-4 text-gray-100">Yeni Sağlık Verisi</h3>
          <div className="space-y-3">
            <input 
              type="date" 
              value={newHealthData.date} 
              onChange={(e) => setNewHealthData({ ...newHealthData, date: e.target.value })} 
              className="w-full p-4 bg-gray-700/50 border-2 border-gray-600 rounded-xl text-white focus:border-red-500 focus:outline-none transition-colors" 
            />
            <select 
              value={newHealthData.type} 
              onChange={(e) => setNewHealthData({ ...newHealthData, type: e.target.value })} 
              className="w-full p-4 bg-gray-700/50 border-2 border-gray-600 rounded-xl text-white focus:border-red-500 focus:outline-none transition-colors"
            >
              <option value="">Veri Tipi Seçin</option>
              <option value="tansiyon">Tansiyon</option>
              <option value="nabız">Nabız</option>
              <option value="uyku">Uyku</option>
              <option value="su">Su Tüketimi</option>
              <option value="adım">Adım</option>
              <option value="diğer">Diğer</option>
            </select>
            <input 
              type="text" 
              value={newHealthData.value} 
              onChange={(e) => setNewHealthData({ ...newHealthData, value: e.target.value })} 
              placeholder="Değer (örn: 120/80, 8 saat, 2L)" 
              className="w-full p-4 bg-gray-700/50 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors" 
            />
            <textarea 
              value={newHealthData.notes} 
              onChange={(e) => setNewHealthData({ ...newHealthData, notes: e.target.value })} 
              placeholder="Notlar (isteğe bağlı)" 
              className="w-full p-4 bg-gray-700/50 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-red-500 focus:outline-none transition-colors" 
              rows="2" 
            />
            <button 
              onClick={handleAddHealthData} 
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-4 rounded-xl font-semibold transition-all hover:scale-105"
            >
              Kaydet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthTracker;