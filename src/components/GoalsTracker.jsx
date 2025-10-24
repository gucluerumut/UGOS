import React, { useState } from 'react';
import { Plus, X, Target, Calendar, TrendingUp, CheckCircle, Clock, Star, Award, BarChart3, Eye, EyeOff, BookOpen, Dumbbell, DollarSign, Briefcase, Heart, Lightbulb, Brain, TrendingDown, Zap } from 'lucide-react';

// Goal Card Component
const GoalCard = ({ goal, isParent = false, isSubGoal = false, goalCategories, goalPeriods, priorities, getProgressPercentage, getSubGoals, getParentGoal, setSelectedGoalForMilestones, selectedGoalForMilestones, updateGoalProgress, toggleGoalStatus, deleteGoal, getMilestoneStats, toggleMilestoneStatus, deleteMilestone, newMilestone, setNewMilestone, addMilestone }) => {
  const category = goalCategories.find(c => c.id === goal.category);
  const period = goalPeriods.find(p => p.id === goal.period);
  const priority = priorities.find(p => p.id === goal.priority);
  const progress = getProgressPercentage(goal);
  const subGoalsCount = getSubGoals(goal.id).length;
  const parentGoal = getParentGoal(goal.id);
  
  return (
    <div className={`bg-gray-800 p-6 rounded-lg ${
      isSubGoal ? 'border-l-4 border-purple-500 bg-gray-800/70' : ''
    } ${isParent ? 'border-2 border-purple-500/30' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={`text-xl font-semibold ${goal.status === 'completed' ? 'text-green-400 line-through' : 'text-gray-100'}`}>
              {isSubGoal && <span className="text-purple-400 mr-2">└─</span>}
              {goal.title}
            </h3>
            <div className="flex items-center gap-2">
              {isParent && subGoalsCount > 0 && (
                <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400">
                  {subGoalsCount} Alt Hedef
                </span>
              )}
              {isSubGoal && parentGoal && (
                <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400">
                  Alt Hedef
                </span>
              )}
              <span className={`px-2 py-1 rounded-full text-xs bg-${period?.color}-500/20 text-${period?.color}-400`}>
                {period?.name}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs bg-${category?.color}-500/20 text-${category?.color}-400`}>
                {category?.name}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs bg-${priority?.color}-500/20 text-${priority?.color}-400`}>
                {priority?.name}
              </span>
            </div>
          </div>
          {goal.description && (
            <p className="text-gray-400 mb-3">{goal.description}</p>
          )}
          
          {/* Progress Bar */}
          {goal.targetValue && (
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">İlerleme</span>
                <span className="text-gray-300">{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`bg-${goal.status === 'completed' ? 'green' : 'blue'}-500 h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-right text-sm text-gray-400 mt-1">{progress}%</div>
            </div>
          )}

          {/* Progress Update */}
          {goal.status === 'active' && goal.targetValue && (
            <div className="flex items-center gap-2 mb-3">
              <input
                type="number"
                placeholder="İlerleme güncelle"
                className="flex-1 bg-gray-700 text-gray-100 px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    updateGoalProgress(goal.id, parseFloat(e.target.value) || 0);
                    e.target.value = '';
                  }
                }}
              />
              <span className="text-gray-400 text-sm">{goal.unit}</span>
            </div>
          )}

          {goal.deadline && (
            <div className="text-sm text-gray-400">
              <Calendar size={14} className="inline mr-1" />
              Hedef Tarih: {new Date(goal.deadline).toLocaleDateString('tr-TR')}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => setSelectedGoalForMilestones(selectedGoalForMilestones === goal.id ? null : goal.id)}
            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            title="Milestone Yönetimi"
          >
            <Target size={20} />
          </button>
          <button
            onClick={() => toggleGoalStatus(goal.id)}
            className={`p-2 rounded-lg transition-colors ${
              goal.status === 'completed'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <CheckCircle size={20} />
          </button>
          <button
            onClick={() => deleteGoal(goal.id)}
            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Milestone Yönetimi Paneli */}
      {selectedGoalForMilestones === goal.id && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
              <Target size={20} className="text-purple-400" />
              Milestone Yönetimi
            </h4>
            <div className="text-sm text-gray-400">
              {(() => {
                const stats = getMilestoneStats(goal);
                return `${stats.completed}/${stats.total} tamamlandı (${stats.progress}%)`;
              })()}
            </div>
          </div>

          {/* Milestone Progress Bar */}
          {goal.milestones && goal.milestones.length > 0 && (
            <div className="mb-4">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getMilestoneStats(goal).progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Milestone Listesi */}
          <div className="space-y-3 mb-4">
            {(goal.milestones || []).map((milestone, index) => (
              <div key={milestone.id} className="flex items-center gap-3 bg-gray-700/30 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 font-mono w-6">#{milestone.order}</span>
                  <button
                    onClick={() => toggleMilestoneStatus(goal.id, milestone.id)}
                    className={`p-1 rounded transition-colors ${
                      milestone.status === 'completed'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    <CheckCircle size={16} />
                  </button>
                </div>
                
                <div className="flex-1">
                  <h5 className={`font-medium ${
                    milestone.status === 'completed' 
                      ? 'text-green-400 line-through' 
                      : 'text-gray-100'
                  }`}>
                    {milestone.title}
                  </h5>
                  {milestone.description && (
                    <p className="text-sm text-gray-400">{milestone.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    {milestone.targetValue && (
                      <span>Hedef: {milestone.targetValue}</span>
                    )}
                    {milestone.deadline && (
                      <span>Son Tarih: {new Date(milestone.deadline).toLocaleDateString('tr-TR')}</span>
                    )}
                    {milestone.status === 'completed' && milestone.completedAt && (
                      <span className="text-green-400">
                        ✓ {new Date(milestone.completedAt).toLocaleDateString('tr-TR')}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => deleteMilestone(goal.id, milestone.id)}
                  className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Yeni Milestone Ekleme Formu */}
          <div className="bg-gray-700/20 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-gray-300 mb-3">Yeni Milestone Ekle</h5>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Milestone başlığı"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-gray-700 text-gray-100 px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
                />
                <input
                  type="number"
                  placeholder="Sıra"
                  value={newMilestone.order}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                  className="bg-gray-700 text-gray-100 px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
                />
              </div>
              <textarea
                placeholder="Açıklama (opsiyonel)"
                value={newMilestone.description}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-gray-700 text-gray-100 px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
                rows="2"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Hedef değer (opsiyonel)"
                  value={newMilestone.targetValue}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, targetValue: e.target.value }))}
                  className="bg-gray-700 text-gray-100 px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
                />
                <input
                  type="date"
                  value={newMilestone.deadline}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, deadline: e.target.value }))}
                  className="bg-gray-700 text-gray-100 px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
                />
              </div>
              <button
                onClick={() => addMilestone(goal.id)}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                Milestone Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GoalsTracker = ({ goals, setGoals }) => {
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'personal',
    period: 'daily',
    priority: 'medium',
    targetValue: '',
    currentValue: 0,
    unit: '',
    deadline: '',
    status: 'active'
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedGoalForMilestones, setSelectedGoalForMilestones] = useState(null);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    targetValue: '',
    deadline: '',
    order: 1
  });
  const [showDependencies, setShowDependencies] = useState(false);
  const [selectedParentGoal, setSelectedParentGoal] = useState(null);
  const [dependencyMode, setDependencyMode] = useState(false);

  // SMART Hedef Şablonları
  const smartGoalTemplates = [
    {
      id: 'fitness-weight-loss',
      title: '10 Kilo Vermek',
      description: 'Sağlıklı beslenme ve düzenli egzersiz ile 3 ayda 10 kilo vermek',
      category: 'health',
      period: 'quarterly',
      priority: 'high',
      targetValue: '10',
      unit: 'kg',
      icon: Dumbbell,
      color: 'red',
      tips: [
        'Haftada 3-4 kez spor yapın',
        'Günlük kalori alımınızı takip edin',
        'Bol su için ve yeterli uyuyun'
      ]
    },
    {
      id: 'reading-books',
      title: 'Yılda 24 Kitap Okumak',
      description: 'Kişisel gelişim için ayda 2 kitap okuma hedefi',
      category: 'education',
      period: 'yearly',
      priority: 'medium',
      targetValue: '24',
      unit: 'kitap',
      icon: BookOpen,
      color: 'purple',
      tips: [
        'Günde en az 30 dakika okuma yapın',
        'Farklı kategorilerden kitaplar seçin',
        'Okuduklarınızı not alın'
      ]
    },
    {
      id: 'save-money',
      title: '50.000 TL Birikim',
      description: 'Acil durum fonu oluşturmak için yıllık birikim hedefi',
      category: 'finance',
      period: 'yearly',
      priority: 'high',
      targetValue: '50000',
      unit: 'TL',
      icon: DollarSign,
      color: 'green',
      tips: [
        'Aylık gelirin %20\'sini biriktir',
        'Gereksiz harcamaları azalt',
        'Yatırım seçeneklerini araştır'
      ]
    },
    {
      id: 'learn-skill',
      title: 'Yeni Beceri Öğrenmek',
      description: '6 ayda yeni bir programlama dili veya teknoloji öğrenmek',
      category: 'career',
      period: 'quarterly',
      priority: 'high',
      targetValue: '1',
      unit: 'beceri',
      icon: Lightbulb,
      color: 'blue',
      tips: [
        'Günde 1-2 saat pratik yapın',
        'Online kursları takip edin',
        'Projeler yaparak pratik edin'
      ]
    },
    {
      id: 'daily-exercise',
      title: 'Günlük Egzersiz',
      description: 'Her gün en az 30 dakika fiziksel aktivite yapmak',
      category: 'health',
      period: 'daily',
      priority: 'medium',
      targetValue: '30',
      unit: 'dakika',
      icon: Dumbbell,
      color: 'orange',
      tips: [
        'Sabah erken saatlerde egzersiz yapın',
        'Farklı aktiviteler deneyin',
        'İlerlemenizi takip edin'
      ]
    },
    {
      id: 'meditation',
      title: 'Günlük Meditasyon',
      description: 'Zihinsel sağlık için günde 15 dakika meditasyon yapmak',
      category: 'personal',
      period: 'daily',
      priority: 'medium',
      targetValue: '15',
      unit: 'dakika',
      icon: Heart,
      color: 'pink',
      tips: [
        'Sakin bir ortam seçin',
        'Nefes egzersizleri yapın',
        'Düzenli olarak pratik edin'
      ]
    },
    {
      id: 'career-promotion',
      title: 'Terfi Almak',
      description: '1 yıl içinde mevcut pozisyondan terfi almak',
      category: 'career',
      period: 'yearly',
      priority: 'high',
      targetValue: '1',
      unit: 'terfi',
      icon: Briefcase,
      color: 'indigo',
      tips: [
        'Performansınızı sürekli geliştirin',
        'Yeni sorumluluklar alın',
        'Mentorluk desteği alın'
      ]
    },
    {
      id: 'water-intake',
      title: 'Günlük Su Tüketimi',
      description: 'Sağlık için günde 2.5 litre su içmek',
      category: 'health',
      period: 'daily',
      priority: 'low',
      targetValue: '2.5',
      unit: 'litre',
      icon: Heart,
      color: 'cyan',
      tips: [
        'Su şişenizi yanınızda taşıyın',
        'Alarm kurarak hatırlatın',
        'Meyve suları da sayılabilir'
      ]
    }
  ];

  const goalPeriods = [
    { id: 'daily', name: 'Günlük', icon: Calendar, color: 'blue' },
    { id: 'weekly', name: 'Haftalık', icon: Calendar, color: 'green' },
    { id: 'monthly', name: 'Aylık', icon: Calendar, color: 'purple' },
    { id: 'quarterly', name: 'Çeyreklik', icon: Calendar, color: 'orange' },
    { id: 'yearly', name: 'Yıllık', icon: Calendar, color: 'red' }
  ];

  const goalCategories = [
    { id: 'personal', name: 'Kişisel', color: 'blue' },
    { id: 'career', name: 'Kariyer', color: 'green' },
    { id: 'health', name: 'Sağlık', color: 'red' },
    { id: 'finance', name: 'Finans', color: 'yellow' },
    { id: 'education', name: 'Eğitim', color: 'purple' },
    { id: 'relationships', name: 'İlişkiler', color: 'pink' }
  ];

  const priorities = [
    { id: 'low', name: 'Düşük', color: 'gray' },
    { id: 'medium', name: 'Orta', color: 'yellow' },
    { id: 'high', name: 'Yüksek', color: 'red' }
  ];

  const addGoal = () => {
    if (newGoal.title.trim()) {
      const goal = {
        id: Date.now(),
        ...newGoal,
        milestones: [],
        parentGoalId: selectedParentGoal,
        subGoals: [],
        dependencies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Eğer ana hedef seçildiyse, ana hedefe alt hedef olarak ekle
      if (selectedParentGoal) {
        setGoals(prev => prev.map(g => 
          g.id === selectedParentGoal 
            ? { ...g, subGoals: [...(g.subGoals || []), goal.id] }
            : g
        ));
      }
      
      setGoals(prev => [...prev, goal]);
      setNewGoal({
        title: '',
        description: '',
        category: 'personal',
        period: 'daily',
        priority: 'medium',
        targetValue: '',
        currentValue: 0,
        unit: '',
        deadline: '',
        status: 'active'
      });
      setSelectedParentGoal(null);
    }
  };

  // Hedef Bağımlılıkları Fonksiyonları
  const addDependency = (goalId, dependentGoalId) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, dependencies: [...(goal.dependencies || []), dependentGoalId] }
        : goal
    ));
  };

  const removeDependency = (goalId, dependentGoalId) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, dependencies: (goal.dependencies || []).filter(id => id !== dependentGoalId) }
        : goal
    ));
  };

  const getParentGoal = (goalId) => {
    return goals.find(goal => (goal.subGoals || []).includes(goalId));
  };

  const getSubGoals = (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    return goals.filter(g => (goal?.subGoals || []).includes(g.id));
  };

  const getDependentGoals = (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    return goals.filter(g => (goal?.dependencies || []).includes(g.id));
  };

  const canCompleteGoal = (goalId) => {
    const dependentGoals = getDependentGoals(goalId);
    return dependentGoals.every(goal => goal.status === 'completed');
  };

  const getGoalHierarchy = () => {
    const parentGoals = goals.filter(goal => !goal.parentGoalId);
    return parentGoals.map(parent => ({
      ...parent,
      subGoals: getSubGoals(parent.id)
    }));
  };

  // AI Destekli Fonksiyonlar
  const getSmartGoalSuggestions = () => {
    const suggestions = [];
    const now = new Date();
    const currentGoals = goals || [];
    
    // Hedef kategorilerini analiz et
    const categoryStats = goalCategories.map(category => {
      const categoryGoals = currentGoals.filter(g => g.category === category.id);
      const completedGoals = categoryGoals.filter(g => g.status === 'completed');
      const successRate = categoryGoals.length > 0 ? (completedGoals.length / categoryGoals.length) * 100 : 0;
      
      return {
        category: category.id,
        name: category.name,
        total: categoryGoals.length,
        completed: completedGoals.length,
        successRate,
        color: category.color
      };
    });

    // Başarı oranı düşük kategoriler için öneriler
    const lowPerformanceCategories = categoryStats.filter(cat => cat.total > 0 && cat.successRate < 50);
    if (lowPerformanceCategories.length > 0) {
      suggestions.push({
        type: 'improvement',
        title: 'Hedef Başarı Oranını Artır',
        description: `${lowPerformanceCategories[0].name} kategorisinde başarı oranınız %${Math.round(lowPerformanceCategories[0].successRate)}. Daha küçük hedefler belirleyin.`,
        icon: '📈',
        color: 'orange',
        category: lowPerformanceCategories[0].category,
        priority: 'high'
      });
    }

    // Hiç hedef olmayan kategoriler
    const emptyCategories = categoryStats.filter(cat => cat.total === 0);
    if (emptyCategories.length > 0) {
      suggestions.push({
        type: 'new_category',
        title: 'Yeni Alan Keşfet',
        description: `${emptyCategories[0].name} alanında henüz hedef belirlemediniz. Bu alanda gelişim fırsatları var.`,
        icon: '🎯',
        color: 'blue',
        category: emptyCategories[0].category,
        priority: 'medium'
      });
    }

    // Günlük hedef eksikliği
    const dailyGoals = currentGoals.filter(g => g.period === 'daily' && g.status === 'active');
    if (dailyGoals.length < 2) {
      suggestions.push({
        type: 'daily_habit',
        title: 'Günlük Alışkanlık Ekle',
        description: 'Günlük hedefleriniz az. Küçük ama tutarlı alışkanlıklar büyük değişimler yaratır.',
        icon: '⏰',
        color: 'green',
        priority: 'medium'
      });
    }

    // Uzun vadeli hedef eksikliği
    const longTermGoals = currentGoals.filter(g => ['yearly', 'quarterly'].includes(g.period) && g.status === 'active');
    if (longTermGoals.length === 0) {
      suggestions.push({
        type: 'long_term',
        title: 'Uzun Vadeli Vizyon',
        description: 'Uzun vadeli hedefleriniz yok. Büyük hayallerinizi somut hedeflere dönüştürün.',
        icon: '🚀',
        color: 'purple',
        priority: 'high'
      });
    }

    return suggestions.slice(0, 4); // En fazla 4 öneri
  };

  const getGoalInsights = () => {
    const currentGoals = goals || [];
    const insights = [];
    
    if (currentGoals.length === 0) {
      return {
        completionRate: 0,
        averageProgress: 0,
        insights: ['Henüz hedef eklenmemiş. İlk hedefinizi ekleyerek başlayın!']
      };
    }

    const completedGoals = currentGoals.filter(g => g.status === 'completed');
    const activeGoals = currentGoals.filter(g => g.status === 'active');
    const completionRate = Math.round((completedGoals.length / currentGoals.length) * 100);
    
    // Ortalama ilerleme hesapla
    const progressGoals = activeGoals.filter(g => g.targetValue && g.currentValue !== undefined);
    const averageProgress = progressGoals.length > 0 
      ? Math.round(progressGoals.reduce((sum, goal) => {
          const progress = Math.min((goal.currentValue / parseFloat(goal.targetValue)) * 100, 100);
          return sum + progress;
        }, 0) / progressGoals.length)
      : 0;

    // İçgörüler oluştur
    if (completionRate >= 80) {
      insights.push('🏆 Harika! Hedef tamamlama oranınız çok yüksek. Daha zorlu hedefler deneyebilirsiniz.');
    } else if (completionRate >= 60) {
      insights.push('👍 İyi gidiyorsunuz! Hedeflerinizin çoğunu başarıyla tamamlıyorsunuz.');
    } else if (completionRate >= 40) {
      insights.push('⚡ Hedef tamamlama oranınız orta seviyede. Daha küçük adımlarla ilerlemeyi deneyin.');
    } else {
      insights.push('💪 Hedeflerinizi daha küçük parçalara bölerek başarı şansınızı artırabilirsiniz.');
    }

    // Kategori analizi
    const categoryPerformance = goalCategories.map(category => {
      const categoryGoals = currentGoals.filter(g => g.category === category.id);
      const completed = categoryGoals.filter(g => g.status === 'completed').length;
      return {
        category: category.name,
        rate: categoryGoals.length > 0 ? (completed / categoryGoals.length) * 100 : 0,
        total: categoryGoals.length
      };
    }).filter(c => c.total > 0).sort((a, b) => b.rate - a.rate);

    if (categoryPerformance.length > 0) {
      const best = categoryPerformance[0];
      const worst = categoryPerformance[categoryPerformance.length - 1];
      
      if (best.rate > 70) {
        insights.push(`🌟 ${best.category} alanında çok başarılısınız (%${Math.round(best.rate)} başarı).`);
      }
      
      if (worst.rate < 30 && categoryPerformance.length > 1) {
        insights.push(`🎯 ${worst.category} alanında gelişim fırsatı var. Daha basit hedeflerle başlayın.`);
      }
    }

    // Zaman analizi
    const overdueGoals = activeGoals.filter(g => g.deadline && new Date(g.deadline) < new Date());
    if (overdueGoals.length > 0) {
      insights.push(`⏰ ${overdueGoals.length} hedefinizin süresi geçmiş. Hedef tarihlerinizi gözden geçirin.`);
    }

    return {
      completionRate,
      averageProgress,
      insights: insights.slice(0, 4),
      categoryPerformance: categoryPerformance.slice(0, 3)
    };
  };

  const getSmartGoalRecommendations = (category) => {
    const recommendations = {
      personal: [
        { title: 'Günlük Meditasyon', target: '10 dakika', period: 'daily' },
        { title: 'Kitap Okuma', target: '1 kitap', period: 'monthly' },
        { title: 'Yeni Beceri Öğrenme', target: '1 beceri', period: 'quarterly' }
      ],
      health: [
        { title: 'Günlük Adım', target: '8000 adım', period: 'daily' },
        { title: 'Su İçme', target: '2 litre', period: 'daily' },
        { title: 'Kilo Verme', target: '5 kg', period: 'quarterly' }
      ],
      career: [
        { title: 'Sertifika Alma', target: '1 sertifika', period: 'quarterly' },
        { title: 'Network Genişletme', target: '10 kişi', period: 'monthly' },
        { title: 'Proje Tamamlama', target: '2 proje', period: 'quarterly' }
      ],
      finance: [
        { title: 'Aylık Tasarruf', target: '1000 TL', period: 'monthly' },
        { title: 'Yatırım Portföyü', target: '10000 TL', period: 'yearly' },
        { title: 'Borç Ödeme', target: '5000 TL', period: 'quarterly' }
      ]
    };

    return recommendations[category] || [];
  };

  // Milestone Yönetimi Fonksiyonları
  const addMilestone = (goalId) => {
    if (newMilestone.title.trim()) {
      const milestone = {
        id: Date.now(),
        ...newMilestone,
        status: 'pending',
        createdAt: new Date().toISOString(),
        completedAt: null
      };

      setGoals(prev => prev.map(goal => {
        if (goal.id === goalId) {
          const milestones = goal.milestones || [];
          return {
            ...goal,
            milestones: [...milestones, milestone].sort((a, b) => a.order - b.order),
            updatedAt: new Date().toISOString()
          };
        }
        return goal;
      }));

      setNewMilestone({
        title: '',
        description: '',
        targetValue: '',
        deadline: '',
        order: 1
      });
    }
  };

  const toggleMilestoneStatus = (goalId, milestoneId) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const milestones = goal.milestones.map(milestone => {
          if (milestone.id === milestoneId) {
            const newStatus = milestone.status === 'completed' ? 'pending' : 'completed';
            return {
              ...milestone,
              status: newStatus,
              completedAt: newStatus === 'completed' ? new Date().toISOString() : null
            };
          }
          return milestone;
        });

        // Hedefin genel ilerlemesini güncelle
        const completedMilestones = milestones.filter(m => m.status === 'completed').length;
        const totalMilestones = milestones.length;
        const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

        return {
          ...goal,
          milestones,
          milestoneProgress,
          updatedAt: new Date().toISOString()
        };
      }
      return goal;
    }));
  };

  const deleteMilestone = (goalId, milestoneId) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const milestones = goal.milestones.filter(m => m.id !== milestoneId);
        const completedMilestones = milestones.filter(m => m.status === 'completed').length;
        const totalMilestones = milestones.length;
        const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

        return {
          ...goal,
          milestones,
          milestoneProgress,
          updatedAt: new Date().toISOString()
        };
      }
      return goal;
    }));
  };

  const getMilestoneStats = (goal) => {
    const milestones = goal.milestones || [];
    const total = milestones.length;
    const completed = milestones.filter(m => m.status === 'completed').length;
    const pending = milestones.filter(m => m.status === 'pending').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, progress };
  };

  const addGoalFromTemplate = (template) => {
    const goal = {
      id: Date.now(),
      title: template.title,
      description: template.description,
      category: template.category,
      period: template.period,
      priority: template.priority,
      targetValue: template.targetValue,
      currentValue: 0,
      unit: template.unit,
      deadline: '',
      status: 'active',
      milestones: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFromTemplate: true,
      templateId: template.id
    };
    setGoals(prev => [...prev, goal]);
    setShowTemplates(false);
  };

  const updateGoalProgress = (goalId, newValue) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const updatedGoal = {
          ...goal,
          currentValue: newValue,
          updatedAt: new Date().toISOString()
        };
        
        // Hedef tamamlandı mı kontrol et
        if (goal.targetValue && newValue >= parseFloat(goal.targetValue)) {
          updatedGoal.status = 'completed';
          updatedGoal.completedAt = new Date().toISOString();
        }
        
        return updatedGoal;
      }
      return goal;
    }));
  };

  const deleteGoal = (goalId) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const toggleGoalStatus = (goalId) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const newStatus = goal.status === 'completed' ? 'active' : 'completed';
        return {
          ...goal,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString()
        };
      }
      return goal;
    }));
  };

  const getGoalsByPeriod = (period) => {
    if (period === 'all') return goals || [];
    return (goals || []).filter(goal => goal.period === period);
  };

  const getGoalStats = () => {
    const allGoals = goals || [];
    const totalGoals = allGoals.length;
    const completedGoals = allGoals.filter(g => g.status === 'completed').length;
    const activeGoals = allGoals.filter(g => g.status === 'active').length;
    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    const periodStats = goalPeriods.map(period => {
      const periodGoals = getGoalsByPeriod(period.id);
      const completed = periodGoals.filter(g => g.status === 'completed').length;
      const total = periodGoals.length;
      return {
        ...period,
        total,
        completed,
        rate: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    });

    return { totalGoals, completedGoals, activeGoals, completionRate, periodStats };
  };

  const getProgressPercentage = (goal) => {
    if (!goal.targetValue) return 0;
    return Math.min(Math.round((goal.currentValue / parseFloat(goal.targetValue)) * 100), 100);
  };

  const filteredGoals = () => {
    let filtered = getGoalsByPeriod(selectedPeriod);
    if (!showCompleted) {
      filtered = filtered.filter(goal => goal.status !== 'completed');
    }
    return filtered;
  };

  const stats = getGoalStats();

  // AI verilerini hesapla
  const smartSuggestions = getSmartGoalSuggestions();
  const goalInsights = getGoalInsights();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Hedefler</h2>
          <p className="text-gray-400">Hedeflerinizi belirleyin ve takip edin</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            {showCompleted ? <Eye size={16} /> : <EyeOff size={16} />}
            {showCompleted ? 'Tamamlananları Gizle' : 'Tamamlananları Göster'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'overview', name: 'Genel Bakış', icon: BarChart3 },
          { id: 'goals', name: 'Hedeflerim', icon: Target },
          { id: 'add', name: 'Hedef Ekle', icon: Plus }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Genel İstatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Toplam Hedef</p>
                  <p className="text-3xl font-bold">{stats.totalGoals}</p>
                </div>
                <Target className="text-blue-200" size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Tamamlanan</p>
                  <p className="text-3xl font-bold">{stats.completedGoals}</p>
                </div>
                <CheckCircle className="text-green-200" size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Aktif</p>
                  <p className="text-3xl font-bold">{stats.activeGoals}</p>
                </div>
                <Clock className="text-orange-200" size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Başarı Oranı</p>
                  <p className="text-3xl font-bold">{stats.completionRate}%</p>
                </div>
                <TrendingUp className="text-purple-200" size={32} />
              </div>
            </div>
          </div>

          {/* Dönem Bazlı İstatistikler */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Dönem Bazlı Başarı</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {stats.periodStats.map(period => (
                <div key={period.id} className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <period.icon size={20} className={`text-${period.color}-400`} />
                    <h4 className="font-medium text-gray-100">{period.name}</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Toplam:</span>
                      <span className="text-gray-200">{period.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tamamlanan:</span>
                      <span className="text-green-400">{period.completed}</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className={`bg-${period.color}-500 h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${period.rate}%` }}
                      ></div>
                    </div>
                    <div className="text-center text-sm font-medium text-gray-200">
                      {period.rate}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Son Eklenen Hedefler */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Son Eklenen Hedefler</h3>
            <div className="space-y-3">
              {(goals || []).slice(-5).reverse().map(goal => {
                const category = goalCategories.find(c => c.id === goal.category);
                const period = goalPeriods.find(p => p.id === goal.period);
                const progress = getProgressPercentage(goal);
                
                return (
                  <div key={goal.id} className="flex items-center justify-between bg-gray-700/30 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-${category?.color}-500`}></div>
                      <div>
                        <h4 className="text-gray-100 font-medium">{goal.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span className={`px-2 py-1 rounded-full text-xs bg-${period?.color}-500/20 text-${period?.color}-400`}>
                            {period?.name}
                          </span>
                          <span>{category?.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${goal.status === 'completed' ? 'text-green-400' : 'text-gray-300'}`}>
                        {goal.status === 'completed' ? 'Tamamlandı' : `${progress}%`}
                      </div>
                      {goal.targetValue && (
                        <div className="text-xs text-gray-400">
                          {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {(goals || []).length === 0 && (
                <p className="text-gray-400 text-center py-4">Henüz hedef eklenmemiş</p>
              )}
            </div>
          </div>

          {/* AI Destekli Akıllı Öneriler */}
          {smartSuggestions.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <Brain className="text-purple-400" />
                AI Destekli Akıllı Öneriler
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {smartSuggestions.map((suggestion, index) => (
                  <div key={index} className={`bg-gradient-to-br from-${suggestion.color}-500/20 to-${suggestion.color}-600/20 p-4 rounded-xl border border-${suggestion.color}-500/30`}>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{suggestion.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-100 mb-1">
                          {suggestion.title}
                        </h4>
                        <p className="text-gray-300 text-sm mb-3">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs bg-${suggestion.color}-500/20 text-${suggestion.color}-400`}>
                            {suggestion.priority === 'high' ? 'Yüksek Öncelik' : 
                             suggestion.priority === 'medium' ? 'Orta Öncelik' : 'Düşük Öncelik'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hedef İçgörüleri */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <Lightbulb className="text-yellow-400" />
              Hedef İçgörüleri
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 rounded-xl border border-cyan-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-100 font-medium">Tamamlama Oranı</span>
                    <span className="text-cyan-400 font-bold text-2xl">{goalInsights.completionRate}%</span>
                  </div>
                  <div className="bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full h-2 transition-all duration-500" 
                      style={{ width: `${goalInsights.completionRate}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-100 font-medium">Ortalama İlerleme</span>
                    <span className="text-green-400 font-bold text-2xl">{goalInsights.averageProgress}%</span>
                  </div>
                  <div className="bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full h-2 transition-all duration-500" 
                      style={{ width: `${goalInsights.averageProgress}%` }}
                    ></div>
                  </div>
                </div>

                {goalInsights.categoryPerformance && goalInsights.categoryPerformance.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-xl border border-purple-500/30">
                    <h4 className="font-medium text-gray-200 mb-3 flex items-center gap-2">
                      <Award className="text-purple-400" size={18} />
                      En Başarılı Kategoriler
                    </h4>
                    <div className="space-y-2">
                      {goalInsights.categoryPerformance.map((category, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">{category.category}</span>
                          <span className="text-purple-400 font-medium">%{Math.round(category.rate)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-200 flex items-center gap-2">
                  <Zap className="text-yellow-400" size={18} />
                  Kişisel İçgörüler
                </h4>
                {goalInsights.insights.map((insight, index) => (
                  <div key={index} className="bg-gray-700/30 p-3 rounded-lg">
                    <p className="text-gray-100 text-sm">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          {/* Filtreler */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedPeriod('all')}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedPeriod === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Tümü
            </button>
            {goalPeriods.map(period => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedPeriod === period.id
                    ? `bg-${period.color}-600 text-white`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {period.name}
              </button>
            ))}
          </div>

          {/* Hiyerarşi Görünümü Toggle */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setShowDependencies(!showDependencies)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                showDependencies
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Target size={16} />
              {showDependencies ? 'Normal Görünüm' : 'Hiyerarşi Görünümü'}
            </button>
          </div>

          {/* Hedefler Listesi */}
          <div className="space-y-4">
            {showDependencies ? (
              // Hiyerarşik Görünüm
              getGoalHierarchy().map(parentGoal => (
                <div key={parentGoal.id} className="space-y-2">
                  {/* Ana Hedef */}
                  <GoalCard 
                    goal={parentGoal} 
                    isParent={true}
                    goalCategories={goalCategories}
                    goalPeriods={goalPeriods}
                    priorities={priorities}
                    getProgressPercentage={getProgressPercentage}
                    getSubGoals={getSubGoals}
                    getParentGoal={getParentGoal}
                    setSelectedGoalForMilestones={setSelectedGoalForMilestones}
                    selectedGoalForMilestones={selectedGoalForMilestones}
                    updateGoalProgress={updateGoalProgress}
                    toggleGoalStatus={toggleGoalStatus}
                    deleteGoal={deleteGoal}
                    getMilestoneStats={getMilestoneStats}
                    toggleMilestoneStatus={toggleMilestoneStatus}
                    deleteMilestone={deleteMilestone}
                    newMilestone={newMilestone}
                    setNewMilestone={setNewMilestone}
                    addMilestone={addMilestone}
                  />
                  
                  {/* Alt Hedefler */}
                  {parentGoal.subGoals.map(subGoal => (
                    <div key={subGoal.id} className="ml-8">
                      <GoalCard 
                        goal={subGoal} 
                        isSubGoal={true}
                        goalCategories={goalCategories}
                        goalPeriods={goalPeriods}
                        priorities={priorities}
                        getProgressPercentage={getProgressPercentage}
                        getSubGoals={getSubGoals}
                        getParentGoal={getParentGoal}
                        setSelectedGoalForMilestones={setSelectedGoalForMilestones}
                        selectedGoalForMilestones={selectedGoalForMilestones}
                        updateGoalProgress={updateGoalProgress}
                        toggleGoalStatus={toggleGoalStatus}
                        deleteGoal={deleteGoal}
                        getMilestoneStats={getMilestoneStats}
                        toggleMilestoneStatus={toggleMilestoneStatus}
                        deleteMilestone={deleteMilestone}
                        newMilestone={newMilestone}
                        setNewMilestone={setNewMilestone}
                        addMilestone={addMilestone}
                      />
                    </div>
                  ))}
                </div>
              ))
            ) : (
              // Normal Görünüm
              filteredGoals().map(goal => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal}
                  goalCategories={goalCategories}
                  goalPeriods={goalPeriods}
                  priorities={priorities}
                  getProgressPercentage={getProgressPercentage}
                  getSubGoals={getSubGoals}
                  getParentGoal={getParentGoal}
                  setSelectedGoalForMilestones={setSelectedGoalForMilestones}
                  selectedGoalForMilestones={selectedGoalForMilestones}
                  updateGoalProgress={updateGoalProgress}
                  toggleGoalStatus={toggleGoalStatus}
                  deleteGoal={deleteGoal}
                  getMilestoneStats={getMilestoneStats}
                  toggleMilestoneStatus={toggleMilestoneStatus}
                  deleteMilestone={deleteMilestone}
                  newMilestone={newMilestone}
                  setNewMilestone={setNewMilestone}
                  addMilestone={addMilestone}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* No Goals Message */}
      {activeTab === 'goals' && filteredGoals().length === 0 && (
        <div className="text-center py-12">
          <Target size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Bu dönemde hedef bulunamadı</p>
          <p className="text-gray-500">Yeni hedef eklemek için "Hedef Ekle" sekmesini kullanın</p>
        </div>
      )}

       {/* Add Goal Tab */}
       {activeTab === 'add' && (
         <div className="max-w-2xl mx-auto">
           {/* Template Toggle */}
           <div className="flex justify-center mb-6">
             <div className="bg-gray-800 p-1 rounded-lg flex">
               <button
                 onClick={() => setShowTemplates(false)}
                 className={`px-4 py-2 rounded-md transition-colors ${
                   !showTemplates
                     ? 'bg-blue-600 text-white'
                     : 'text-gray-400 hover:text-gray-200'
                 }`}
               >
                 Manuel Hedef
               </button>
               <button
                 onClick={() => setShowTemplates(true)}
                 className={`px-4 py-2 rounded-md transition-colors ${
                   showTemplates
                     ? 'bg-blue-600 text-white'
                     : 'text-gray-400 hover:text-gray-200'
                 }`}
               >
                 SMART Şablonlar
               </button>
             </div>
           </div>

           {/* SMART Templates */}
           {showTemplates && (
             <div className="space-y-6">
               <div className="text-center mb-6">
                 <h3 className="text-2xl font-semibold text-gray-100 mb-2">SMART Hedef Şablonları</h3>
                 <p className="text-gray-400">Önceden tanımlı hedef formatlarından birini seçin</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {smartGoalTemplates.map(template => {
                   const IconComponent = template.icon;
                   return (
                     <div key={template.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                       <div className="flex items-start gap-4">
                         <div className={`p-3 rounded-lg bg-${template.color}-500/20`}>
                           <IconComponent size={24} className={`text-${template.color}-400`} />
                         </div>
                         <div className="flex-1">
                           <h4 className="text-lg font-semibold text-gray-100 mb-2">{template.title}</h4>
                           <p className="text-gray-400 text-sm mb-3">{template.description}</p>
                           
                           <div className="flex items-center gap-2 mb-3">
                             <span className={`px-2 py-1 rounded-full text-xs bg-${template.color}-500/20 text-${template.color}-400`}>
                               {goalPeriods.find(p => p.id === template.period)?.name}
                             </span>
                             <span className={`px-2 py-1 rounded-full text-xs bg-gray-600 text-gray-300`}>
                               {goalCategories.find(c => c.id === template.category)?.name}
                             </span>
                             <span className="text-gray-400 text-sm">
                               {template.targetValue} {template.unit}
                             </span>
                           </div>

                           {/* Tips */}
                           <div className="mb-4">
                             <h5 className="text-sm font-medium text-gray-300 mb-2">💡 İpuçları:</h5>
                             <ul className="space-y-1">
                               {template.tips.map((tip, index) => (
                                 <li key={index} className="text-xs text-gray-400 flex items-start gap-1">
                                   <span className="text-gray-500 mt-1">•</span>
                                   <span>{tip}</span>
                                 </li>
                               ))}
                             </ul>
                           </div>

                           <button
                             onClick={() => addGoalFromTemplate(template)}
                             className={`w-full bg-${template.color}-600 text-white py-2 px-4 rounded-lg hover:bg-${template.color}-700 transition-colors text-sm font-medium`}
                           >
                             Bu Şablonu Kullan
                           </button>
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>
           )}

           {/* Manual Goal Form */}
           {!showTemplates && (
             <div className="bg-gray-800 p-6 rounded-lg">
               <h3 className="text-xl font-semibold text-gray-100 mb-6">Yeni Hedef Ekle</h3>
               
               <div className="space-y-4">
                 <div>
                   <label className="block text-gray-300 text-sm font-medium mb-2">Hedef Başlığı</label>
                   <input
                     type="text"
                     value={newGoal.title}
                     onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                     className="w-full bg-gray-700 text-gray-100 px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                     placeholder="Hedef başlığını girin"
                   />
                 </div>

                 <div>
                   <label className="block text-gray-300 text-sm font-medium mb-2">Açıklama</label>
                   <textarea
                     value={newGoal.description}
                     onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                     className="w-full bg-gray-700 text-gray-100 px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                     placeholder="Hedef açıklaması (opsiyonel)"
                     rows="3"
                   />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-gray-300 text-sm font-medium mb-2">Kategori</label>
                     <select
                       value={newGoal.category}
                       onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value }))}
                       className="w-full bg-gray-700 text-gray-100 px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                     >
                       {goalCategories.map(category => (
                         <option key={category.id} value={category.id}>{category.name}</option>
                       ))}
                     </select>
                   </div>

                   <div>
                     <label className="block text-gray-300 text-sm font-medium mb-2">Dönem</label>
                     <select
                       value={newGoal.period}
                       onChange={(e) => setNewGoal(prev => ({ ...prev, period: e.target.value }))}
                       className="w-full bg-gray-700 text-gray-100 px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                     >
                       {goalPeriods.map(period => (
                         <option key={period.id} value={period.id}>{period.name}</option>
                       ))}
                     </select>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                     <label className="block text-gray-300 text-sm font-medium mb-2">Hedef Değer</label>
                     <input
                       type="number"
                       value={newGoal.targetValue}
                       onChange={(e) => setNewGoal(prev => ({ ...prev, targetValue: e.target.value }))}
                       className="w-full bg-gray-700 text-gray-100 px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                       placeholder="100"
                     />
                   </div>

                   <div>
                     <label className="block text-gray-300 text-sm font-medium mb-2">Birim</label>
                     <input
                       type="text"
                       value={newGoal.unit}
                       onChange={(e) => setNewGoal(prev => ({ ...prev, unit: e.target.value }))}
                       className="w-full bg-gray-700 text-gray-100 px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                       placeholder="kg, saat, adet..."
                     />
                   </div>

                   <div>
                     <label className="block text-gray-300 text-sm font-medium mb-2">Öncelik</label>
                     <select
                       value={newGoal.priority}
                       onChange={(e) => setNewGoal(prev => ({ ...prev, priority: e.target.value }))}
                       className="w-full bg-gray-700 text-gray-100 px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                     >
                       {priorities.map(priority => (
                         <option key={priority.id} value={priority.id}>{priority.name}</option>
                       ))}
                     </select>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-gray-300 text-sm font-medium mb-2">Hedef Tarih</label>
                     <input
                       type="date"
                       value={newGoal.deadline}
                       onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                       className="w-full bg-gray-700 text-gray-100 px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                     />
                   </div>

                   <div>
                     <label className="block text-gray-300 text-sm font-medium mb-2">Ana Hedef (Opsiyonel)</label>
                     <select
                       value={selectedParentGoal || ''}
                       onChange={(e) => setSelectedParentGoal(e.target.value || null)}
                       className="w-full bg-gray-700 text-gray-100 px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                     >
                       <option value="">Bağımsız hedef</option>
                       {goals.filter(g => g.status === 'active' && !g.parentGoalId).map(goal => (
                         <option key={goal.id} value={goal.id}>{goal.title}</option>
                       ))}
                     </select>
                     {selectedParentGoal && (
                       <p className="text-sm text-blue-400 mt-1">
                         Bu hedef seçilen ana hedefe bağlı alt hedef olarak eklenecek
                       </p>
                     )}
                   </div>
                 </div>

                 <button
                   onClick={addGoal}
                   className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                 >
                   Hedef Ekle
                 </button>
               </div>
             </div>
           )}
         </div>
       )}
     </div>
   );
 };

export default GoalsTracker;