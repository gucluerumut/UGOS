import React, { useState, useEffect } from 'react';
import { 
  Quote, 
  Trophy, 
  TrendingUp, 
  Star, 
  Heart, 
  Sparkles, 
  Target, 
  Award,
  Calendar,
  Flame,
  Crown,
  Zap,
  Gift,
  Flower,
  Building,
  TreePine
} from 'lucide-react';

const MotivationTools = ({ 
  motivationData = {
    dailyQuotes: [],
    celebrations: [],
    progressVisualization: { type: 'flower', level: 1, points: 0 },
    personalRecords: []
  }, 
  setMotivationData 
}) => {
  const [activeTab, setActiveTab] = useState('quotes');
  const [currentQuote, setCurrentQuote] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  // Günlük alıntılar koleksiyonu
  const inspirationalQuotes = [
    {
      text: "Başarı, küçük çabaların günlük olarak tekrarlanmasıdır.",
      author: "Robert Collier",
      category: "Başarı"
    },
    {
      text: "Hayallerinizi gerçekleştirmek için önce uyanmanız gerekir.",
      author: "Josiah Gilbert Holland",
      category: "Hayaller"
    },
    {
      text: "Mükemmellik bir alışkanlıktır, tek seferlik bir eylem değil.",
      author: "Aristoteles",
      category: "Mükemmellik"
    },
    {
      text: "Başarısızlık sadece yeniden başlamak için bir fırsattır.",
      author: "Henry Ford",
      category: "Başarısızlık"
    },
    {
      text: "Büyük işler yapmak için büyük riskler almak gerekir.",
      author: "Herakleitos",
      category: "Risk"
    },
    {
      text: "Değişim acı verir, ama değişmemek daha da acı verir.",
      author: "Tony Robbins",
      category: "Değişim"
    },
    {
      text: "Kendinize inanın ve ne istediğinizi bilin. Sonra çalışın.",
      author: "Russell Simmons",
      category: "İnanç"
    },
    {
      text: "Başarı, hazırlık ile fırsatın buluştuğu andır.",
      author: "Seneca",
      category: "Hazırlık"
    }
  ];

  // İlerleme görselleştirme seviyeleri
  const visualizationLevels = {
    flower: [
      { level: 1, name: 'Tohum', icon: '🌱', description: 'Yeni başlangıçlar' },
      { level: 2, name: 'Filiz', icon: '🌿', description: 'İlk adımlar' },
      { level: 3, name: 'Yaprak', icon: '🍃', description: 'Büyüme' },
      { level: 4, name: 'Tomurcuk', icon: '🌺', description: 'Gelişim' },
      { level: 5, name: 'Çiçek', icon: '🌸', description: 'Başarı' },
      { level: 6, name: 'Meyve', icon: '🍎', description: 'Olgunluk' }
    ],
    city: [
      { level: 1, name: 'Arsa', icon: '🏗️', description: 'Temel atma' },
      { level: 2, name: 'Ev', icon: '🏠', description: 'İlk yapı' },
      { level: 3, name: 'Mahalle', icon: '🏘️', description: 'Genişleme' },
      { level: 4, name: 'İlçe', icon: '🏙️', description: 'Büyüme' },
      { level: 5, name: 'Şehir', icon: '🌆', description: 'Gelişim' },
      { level: 6, name: 'Metropol', icon: '🌃', description: 'Başarı' }
    ]
  };

  // Günlük alıntı getir
  const getDailyQuote = () => {
    const today = new Date().toDateString();
    const savedQuote = motivationData.dailyQuotes.find(q => q.date === today);
    
    if (savedQuote) {
      return savedQuote.quote;
    }
    
    // Yeni günlük alıntı seç
    const randomQuote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];
    const newQuote = { date: today, quote: randomQuote };
    
    setMotivationData(prev => ({
      ...prev,
      dailyQuotes: [...prev.dailyQuotes.filter(q => q.date !== today), newQuote]
    }));
    
    return randomQuote;
  };

  // Başarı kutlaması tetikle
  const triggerCelebration = (message, type = 'success') => {
    setCelebrationMessage(message);
    setShowCelebration(true);
    
    const celebration = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString(),
      animation: type === 'milestone' ? 'fireworks' : 'confetti'
    };
    
    setMotivationData(prev => ({
      ...prev,
      celebrations: [celebration, ...prev.celebrations.slice(0, 49)] // Son 50 kutlama
    }));
    
    setTimeout(() => setShowCelebration(false), 3000);
  };

  // İlerleme puanı ekle
  const addProgressPoints = (points, reason) => {
    setMotivationData(prev => {
      const newPoints = prev.progressVisualization.points + points;
      const currentLevel = prev.progressVisualization.level;
      const pointsPerLevel = 100;
      const newLevel = Math.floor(newPoints / pointsPerLevel) + 1;
      
      if (newLevel > currentLevel) {
        triggerCelebration(`🎉 Seviye ${newLevel}'e ulaştınız!`, 'milestone');
      }
      
      return {
        ...prev,
        progressVisualization: {
          ...prev.progressVisualization,
          points: newPoints,
          level: newLevel
        }
      };
    });
  };

  // Kişisel rekor ekle
  const addPersonalRecord = (category, value, description) => {
    const record = {
      id: Date.now(),
      category,
      value,
      description,
      date: new Date().toISOString(),
      isNew: true
    };
    
    setMotivationData(prev => ({
      ...prev,
      personalRecords: [record, ...prev.personalRecords]
    }));
    
    triggerCelebration(`🏆 Yeni kişisel rekor: ${description}`, 'record');
  };

  // İlerleme görselleştirme türünü değiştir
  const changeVisualizationType = (type) => {
    setMotivationData(prev => ({
      ...prev,
      progressVisualization: {
        ...prev.progressVisualization,
        type
      }
    }));
  };

  useEffect(() => {
    setCurrentQuote(getDailyQuote());
  }, []);

  const tabs = [
    { id: 'quotes', label: 'Günlük Alıntılar', icon: Quote },
    { id: 'celebrations', label: 'Kutlamalar', icon: Sparkles },
    { id: 'visualization', label: 'İlerleme Görselleştirme', icon: TrendingUp },
    { id: 'records', label: 'Kişisel Rekorlar', icon: Trophy }
  ];

  const currentVisualization = visualizationLevels[motivationData.progressVisualization.type];
  const currentLevelData = currentVisualization[Math.min(motivationData.progressVisualization.level - 1, currentVisualization.length - 1)];
  const progressPercentage = (motivationData.progressVisualization.points % 100);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      {/* Kutlama Animasyonu */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 rounded-2xl text-center animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">{celebrationMessage}</h2>
            <div className="flex justify-center space-x-2">
              <Sparkles className="text-yellow-300 animate-pulse" />
              <Star className="text-yellow-300 animate-pulse" />
              <Sparkles className="text-yellow-300 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            🎯 Motivasyon Araçları
          </h1>
          <p className="text-gray-400">Söz al, başarılarını kutla ve ilerlemeni görselleştir</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }`}
              >
                <IconComponent size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Günlük Alıntılar */}
        {activeTab === 'quotes' && (
          <div className="space-y-6">
            {/* Bugünün Alıntısı */}
            {currentQuote && (
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-2xl text-center">
                <Quote size={48} className="text-white mx-auto mb-4" />
                <blockquote className="text-2xl font-medium text-white mb-4">
                  "{currentQuote.text}"
                </blockquote>
                <cite className="text-blue-200 text-lg">— {currentQuote.author}</cite>
                <div className="mt-4">
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                    {currentQuote.category}
                  </span>
                </div>
              </div>
            )}

            {/* Alıntı Geçmişi */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Geçmiş Alıntılar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {motivationData.dailyQuotes.slice(0, 6).map((item, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-300 mb-2">"{item.quote.text}"</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">— {item.quote.author}</span>
                      <span className="text-gray-500">{new Date(item.date).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Yeni Alıntı Butonu */}
            <div className="text-center">
              <button
                onClick={() => setCurrentQuote(getDailyQuote())}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Yeni Alıntı Al
              </button>
            </div>
          </div>
        )}

        {/* Kutlamalar */}
        {activeTab === 'celebrations' && (
          <div className="space-y-6">
            {/* Test Kutlama Butonları */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Kutlama Testi</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => triggerCelebration('🎉 Harika bir iş çıkardınız!', 'success')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Başarı Kutlaması
                </button>
                <button
                  onClick={() => triggerCelebration('🏆 Milestone tamamlandı!', 'milestone')}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Milestone Kutlaması
                </button>
                <button
                  onClick={() => addProgressPoints(25, 'Test')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  +25 Puan Ekle
                </button>
              </div>
            </div>

            {/* Kutlama Geçmişi */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles size={20} />
                Kutlama Geçmişi
              </h3>
              {motivationData.celebrations.length === 0 ? (
                <div className="text-center py-8">
                  <Gift size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Henüz kutlama yok</p>
                  <p className="text-gray-500">İlk başarınızı kutlamak için yukarıdaki butonları kullanın</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {motivationData.celebrations.slice(0, 10).map((celebration) => (
                    <div key={celebration.id} className="bg-gray-700 p-4 rounded-lg flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        celebration.type === 'milestone' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}>
                        {celebration.type === 'milestone' ? <Crown size={16} /> : <Star size={16} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-200">{celebration.message}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(celebration.timestamp).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* İlerleme Görselleştirme */}
        {activeTab === 'visualization' && (
          <div className="space-y-6">
            {/* Mevcut Seviye */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-8 rounded-2xl text-center">
              <div className="text-8xl mb-4">{currentLevelData.icon}</div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Seviye {motivationData.progressVisualization.level}: {currentLevelData.name}
              </h2>
              <p className="text-green-200 text-lg mb-4">{currentLevelData.description}</p>
              <div className="bg-white bg-opacity-20 rounded-full h-4 mb-2">
                <div 
                  className="bg-white h-4 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-white">
                {motivationData.progressVisualization.points} puan 
                ({100 - progressPercentage} puan sonraki seviyeye)
              </p>
            </div>

            {/* Görselleştirme Türü Seçimi */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Görselleştirme Türü</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => changeVisualizationType('flower')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    motivationData.progressVisualization.type === 'flower'
                      ? 'border-green-500 bg-green-500 bg-opacity-20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <Flower size={32} className="mx-auto mb-2 text-green-400" />
                  <h4 className="font-semibold">Çiçek Büyütme</h4>
                  <p className="text-gray-400 text-sm">Tohumdan çiçeğe doğru büyüme</p>
                </button>
                <button
                  onClick={() => changeVisualizationType('city')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    motivationData.progressVisualization.type === 'city'
                      ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <Building size={32} className="mx-auto mb-2 text-blue-400" />
                  <h4 className="font-semibold">Şehir İnşa Etme</h4>
                  <p className="text-gray-400 text-sm">Arsadan metropole doğru inşa</p>
                </button>
              </div>
            </div>

            {/* Seviye Haritası */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Seviye Haritası</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {currentVisualization.map((level, index) => (
                  <div 
                    key={level.level}
                    className={`p-4 rounded-lg text-center ${
                      motivationData.progressVisualization.level >= level.level
                        ? 'bg-green-600 bg-opacity-20 border border-green-500'
                        : 'bg-gray-700 border border-gray-600'
                    }`}
                  >
                    <div className="text-3xl mb-2">{level.icon}</div>
                    <h4 className="font-semibold">{level.name}</h4>
                    <p className="text-sm text-gray-400">{level.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Seviye {level.level}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Kişisel Rekorlar */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            {/* Yeni Rekor Ekleme */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Yeni Kişisel Rekor Ekle</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => addPersonalRecord('fitness', '100 kg', '100 kg squat')}
                  className="bg-red-600 text-white p-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trophy size={24} className="mx-auto mb-2" />
                  Fitness Rekoru
                </button>
                <button
                  onClick={() => addPersonalRecord('learning', '5 saat', '5 saat kesintisiz çalışma')}
                  className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Target size={24} className="mx-auto mb-2" />
                  Öğrenme Rekoru
                </button>
                <button
                  onClick={() => addPersonalRecord('productivity', '10 görev', '10 görev tek günde')}
                  className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Zap size={24} className="mx-auto mb-2" />
                  Verimlilik Rekoru
                </button>
              </div>
            </div>

            {/* Rekor Listesi */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Award size={20} />
                Kişisel Rekorlarım
              </h3>
              {motivationData.personalRecords.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Henüz kişisel rekor yok</p>
                  <p className="text-gray-500">İlk rekorunuzu eklemek için yukarıdaki butonları kullanın</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {motivationData.personalRecords.map((record) => (
                    <div key={record.id} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy size={16} className={`${
                          record.category === 'fitness' ? 'text-red-400' :
                          record.category === 'learning' ? 'text-blue-400' :
                          'text-green-400'
                        }`} />
                        <span className="text-sm text-gray-400 capitalize">{record.category}</span>
                        {record.isNew && (
                          <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full">YENİ</span>
                        )}
                      </div>
                      <h4 className="font-semibold text-lg">{record.value}</h4>
                      <p className="text-gray-300 text-sm">{record.description}</p>
                      <p className="text-gray-500 text-xs mt-2">
                        {new Date(record.date).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MotivationTools;