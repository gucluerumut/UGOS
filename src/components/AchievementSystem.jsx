import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, Star, Flame, Target, Calendar, TrendingUp, Award, Medal, Crown, 
  Zap, Heart, Brain, Book, Dumbbell, Clock, CheckCircle, Lock, Gift, 
  Coffee, Moon, Sunrise, Mountain, Rocket, Shield, Diamond, Sparkles, 
  Wand2, Compass, Flag, Lightbulb, Building, Plus, Hammer, Eye, 
  Sun, GraduationCap, BarChart3, Activity, Users, Timer, Gamepad2, 
  ChevronRight, ChevronDown, Filter, Search, RefreshCw, Settings,
  TrendingDown, ArrowUp, ArrowDown, Percent, Hash, Calendar as CalendarIcon
} from 'lucide-react';

const AchievementSystem = ({ 
  userData = {}, 
  goals = [], 
  habits = [], 
  tasks = [], 
  focusEntries = [], 
  workouts = [], 
  meditationData = [], 
  booksRead = [], 
  healthData = [], 
  learningEntries = [] 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUnlocked, setShowUnlocked] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('progress');
  const [expandedCategories, setExpandedCategories] = useState(new Set(['productivity']));
  const [animatingBadges, setAnimatingBadges] = useState(new Set());

  // Comprehensive badge system
  const badgeCategories = {
    productivity: {
      name: 'Verimlilik',
      icon: Zap,
      color: 'yellow',
      description: 'Görev tamamlama ve verimlilik rozetleri',
      badges: [
        { id: 'first-task', name: 'İlk Adım', desc: 'İlk görevinizi tamamladınız', icon: CheckCircle, req: 1, type: 'tasks_completed', xp: 25, rarity: 'common' },
        { id: 'task-rookie', name: 'Acemi', desc: '10 görev tamamladınız', icon: Target, req: 10, type: 'tasks_completed', xp: 100, rarity: 'common' },
        { id: 'task-warrior', name: 'Savaşçı', desc: '50 görev tamamladınız', icon: Shield, req: 50, type: 'tasks_completed', xp: 250, rarity: 'uncommon' },
        { id: 'task-master', name: 'Usta', desc: '100 görev tamamladınız', icon: Crown, req: 100, type: 'tasks_completed', xp: 500, rarity: 'rare' },
        { id: 'task-legend', name: 'Efsane', desc: '500 görev tamamladınız', icon: Diamond, req: 500, type: 'tasks_completed', xp: 1000, rarity: 'legendary' },
        { id: 'daily-hero', name: 'Günlük Kahraman', desc: 'Bir günde 20 görev tamamladınız', icon: Rocket, req: 20, type: 'daily_tasks', xp: 200, rarity: 'uncommon' },
        { id: 'speed-demon', name: 'Hız Şeytanı', desc: '1 saatte 10 görev tamamladınız', icon: Zap, req: 10, type: 'hourly_tasks', xp: 300, rarity: 'rare' },
        { id: 'perfectionist', name: 'Mükemmeliyetçi', desc: '7 gün üst üste tüm görevleri tamamladınız', icon: Star, req: 7, type: 'perfect_streak', xp: 400, rarity: 'epic' }
      ]
    },
    focus: {
      name: 'Odaklanma',
      icon: Brain,
      color: 'purple',
      description: 'Konsantrasyon ve odaklanma rozetleri',
      badges: [
        { id: 'first-focus', name: 'İlk Odak', desc: 'İlk odaklanma seansınızı tamamladınız', icon: Eye, req: 1, type: 'focus_sessions', xp: 25, rarity: 'common' },
        { id: 'focus-novice', name: 'Odak Çırakı', desc: '10 saat odaklandınız', icon: Clock, req: 600, type: 'focus_minutes', xp: 100, rarity: 'common' },
        { id: 'focus-adept', name: 'Odak Ustası', desc: '50 saat odaklandınız', icon: Brain, req: 3000, type: 'focus_minutes', xp: 300, rarity: 'uncommon' },
        { id: 'focus-master', name: 'Odak Efendisi', desc: '100 saat odaklandınız', icon: Diamond, req: 6000, type: 'focus_minutes', xp: 600, rarity: 'rare' },
        { id: 'focus-legend', name: 'Odak Efsanesi', desc: '500 saat odaklandınız', icon: Crown, req: 30000, type: 'focus_minutes', xp: 1500, rarity: 'legendary' },
        { id: 'marathon-focus', name: 'Maraton Odağı', desc: '8 saat kesintisiz odaklandınız', icon: Mountain, req: 480, type: 'longest_focus', xp: 400, rarity: 'epic' },
        { id: 'laser-focus', name: 'Lazer Odak', desc: '30 gün üst üste odaklandınız', icon: Zap, req: 30, type: 'focus_streak', xp: 500, rarity: 'epic' },
        { id: 'deep-work', name: 'Derin Çalışma', desc: '4 saat kesintisiz odaklandınız', icon: Compass, req: 240, type: 'longest_focus', xp: 250, rarity: 'rare' }
      ]
    },
    health: {
      name: 'Sağlık',
      icon: Heart,
      color: 'red',
      description: 'Fitness ve sağlık rozetleri',
      badges: [
        { id: 'first-workout', name: 'İlk Antrenman', desc: 'İlk antrenmana başladınız', icon: Dumbbell, req: 1, type: 'workouts_completed', xp: 25, rarity: 'common' },
        { id: 'fitness-rookie', name: 'Fitness Acemisi', desc: '10 antrenman tamamladınız', icon: Activity, req: 10, type: 'workouts_completed', xp: 100, rarity: 'common' },
        { id: 'fitness-warrior', name: 'Fitness Savaşçısı', desc: '50 antrenman tamamladınız', icon: Shield, req: 50, type: 'workouts_completed', xp: 300, rarity: 'uncommon' },
        { id: 'fitness-champion', name: 'Fitness Şampiyonu', desc: '100 antrenman tamamladınız', icon: Trophy, req: 100, type: 'workouts_completed', xp: 600, rarity: 'rare' },
        { id: 'iron-will', name: 'Demir İrade', desc: '30 gün üst üste antrenman yaptınız', icon: Flame, req: 30, type: 'workout_streak', xp: 400, rarity: 'epic' },
        { id: 'early-bird', name: 'Erken Kuş', desc: 'Sabah 6\'da antrenman yaptınız', icon: Sunrise, req: 1, type: 'early_workout', xp: 150, rarity: 'uncommon' },
        { id: 'night-warrior', name: 'Gece Savaşçısı', desc: 'Gece 22\'den sonra antrenman yaptınız', icon: Moon, req: 1, type: 'late_workout', xp: 150, rarity: 'uncommon' },
        { id: 'calorie-burner', name: 'Kalori Yakıcısı', desc: 'Bir günde 1000 kalori yaktınız', icon: Flame, req: 1000, type: 'daily_calories', xp: 200, rarity: 'rare' }
      ]
    },
    learning: {
      name: 'Öğrenme',
      icon: Book,
      color: 'green',
      description: 'Kitap okuma ve öğrenme rozetleri',
      badges: [
        { id: 'first-book', name: 'İlk Kitap', desc: 'İlk kitabınızı okudunuz', icon: Book, req: 1, type: 'books_read', xp: 50, rarity: 'common' },
        { id: 'bookworm', name: 'Kitap Kurdu', desc: '10 kitap okudunuz', icon: Wand2, req: 10, type: 'books_read', xp: 200, rarity: 'uncommon' },
        { id: 'scholar', name: 'Bilgin', desc: '50 kitap okudunuz', icon: GraduationCap, req: 50, type: 'books_read', xp: 500, rarity: 'rare' },
        { id: 'sage', name: 'Bilge', desc: '100 kitap okudunuz', icon: Crown, req: 100, type: 'books_read', xp: 1000, rarity: 'epic' },
        { id: 'speed-reader', name: 'Hızlı Okuyucu', desc: 'Bir günde 100 sayfa okudunuz', icon: Zap, req: 100, type: 'daily_pages', xp: 200, rarity: 'rare' },
        { id: 'night-owl', name: 'Gece Kuşu', desc: 'Gece yarısından sonra okudunuz', icon: Moon, req: 1, type: 'night_reading', xp: 100, rarity: 'uncommon' },
        { id: 'knowledge-seeker', name: 'Bilgi Arayıcısı', desc: '30 gün üst üste okudunuz', icon: Compass, req: 30, type: 'reading_streak', xp: 400, rarity: 'epic' }
      ]
    },
    meditation: {
      name: 'Meditasyon',
      icon: Heart,
      color: 'indigo',
      description: 'Meditasyon ve mindfulness rozetleri',
      badges: [
        { id: 'first-meditation', name: 'İlk Nefes', desc: 'İlk meditasyonunuzu yaptınız', icon: Sparkles, req: 1, type: 'meditation_sessions', xp: 25, rarity: 'common' },
        { id: 'zen-novice', name: 'Zen Çırakı', desc: '10 saat meditasyon yaptınız', icon: Compass, req: 600, type: 'meditation_minutes', xp: 150, rarity: 'common' },
        { id: 'zen-master', name: 'Zen Ustası', desc: '50 saat meditasyon yaptınız', icon: Mountain, req: 3000, type: 'meditation_minutes', xp: 400, rarity: 'uncommon' },
        { id: 'enlightened', name: 'Aydınlanmış', desc: '100 saat meditasyon yaptınız', icon: Sun, req: 6000, type: 'meditation_minutes', xp: 800, rarity: 'rare' },
        { id: 'inner-peace', name: 'İç Huzur', desc: '30 gün üst üste meditasyon yaptınız', icon: Heart, req: 30, type: 'meditation_streak', xp: 300, rarity: 'epic' },
        { id: 'deep-trance', name: 'Derin Trans', desc: '2 saat kesintisiz meditasyon yaptınız', icon: Eye, req: 120, type: 'longest_meditation', xp: 250, rarity: 'rare' },
        { id: 'mindful-master', name: 'Bilinçli Usta', desc: '365 gün meditasyon yaptınız', icon: Crown, req: 365, type: 'meditation_days', xp: 1000, rarity: 'legendary' }
      ]
    },
    habits: {
      name: 'Alışkanlıklar',
      icon: Target,
      color: 'blue',
      description: 'Alışkanlık oluşturma rozetleri',
      badges: [
        { id: 'first-habit', name: 'İlk Alışkanlık', desc: 'İlk alışkanlığınızı oluşturdunuz', icon: Plus, req: 1, type: 'habits_created', xp: 25, rarity: 'common' },
        { id: 'habit-builder', name: 'Alışkanlık Kurucusu', desc: '10 alışkanlık oluşturdunuz', icon: Building, req: 10, type: 'habits_created', xp: 150, rarity: 'uncommon' },
        { id: 'consistency-king', name: 'Tutarlılık Kralı', desc: '7 gün üst üste alışkanlık yaptınız', icon: Crown, req: 7, type: 'habit_streak', xp: 200, rarity: 'uncommon' },
        { id: 'habit-master', name: 'Alışkanlık Ustası', desc: '30 gün üst üste alışkanlık yaptınız', icon: Diamond, req: 30, type: 'habit_streak', xp: 500, rarity: 'rare' },
        { id: 'perfectionist', name: 'Mükemmeliyetçi', desc: 'Bir günde tüm alışkanlıklarınızı tamamladınız', icon: Star, req: 1, type: 'perfect_day', xp: 300, rarity: 'epic' },
        { id: 'habit-legend', name: 'Alışkanlık Efsanesi', desc: '100 gün üst üste alışkanlık yaptınız', icon: Flame, req: 100, type: 'habit_streak', xp: 1000, rarity: 'legendary' }
      ]
    },
    goals: {
      name: 'Hedefler',
      icon: Trophy,
      color: 'orange',
      description: 'Hedef belirleme ve tamamlama rozetleri',
      badges: [
        { id: 'first-goal', name: 'İlk Hedef', desc: 'İlk hedefinizi belirlediniz', icon: Flag, req: 1, type: 'goals_created', xp: 50, rarity: 'common' },
        { id: 'goal-crusher', name: 'Hedef Kırıcısı', desc: '10 hedef tamamladınız', icon: Hammer, req: 10, type: 'goals_completed', xp: 300, rarity: 'uncommon' },
        { id: 'dream-chaser', name: 'Rüya Avcısı', desc: '25 hedef tamamladınız', icon: Rocket, req: 25, type: 'goals_completed', xp: 600, rarity: 'rare' },
        { id: 'visionary', name: 'Vizyoner', desc: '50 hedef tamamladınız', icon: Eye, req: 50, type: 'goals_completed', xp: 1000, rarity: 'epic' },
        { id: 'ambitious', name: 'Hırslı', desc: 'Aynı anda 10 aktif hedefiniz var', icon: TrendingUp, req: 10, type: 'active_goals', xp: 200, rarity: 'uncommon' },
        { id: 'overachiever', name: 'Aşırı Başarılı', desc: 'Hedefi süresinden önce tamamladınız', icon: Clock, req: 1, type: 'early_completion', xp: 250, rarity: 'rare' }
      ]
    },
    special: {
      name: 'Özel',
      icon: Gift,
      color: 'pink',
      description: 'Özel etkinlik ve milestone rozetleri',
      badges: [
        { id: 'first-week', name: 'İlk Hafta', desc: 'UGOS\'u 7 gün kullandınız', icon: Calendar, req: 7, type: 'usage_days', xp: 100, rarity: 'common' },
        { id: 'monthly-user', name: 'Aylık Kullanıcı', desc: 'UGOS\'u 30 gün kullandınız', icon: CalendarIcon, req: 30, type: 'usage_days', xp: 300, rarity: 'uncommon' },
        { id: 'loyal-user', name: 'Sadık Kullanıcı', desc: 'UGOS\'u 100 gün kullandınız', icon: Heart, req: 100, type: 'usage_days', xp: 800, rarity: 'rare' },
        { id: 'power-user', name: 'Güç Kullanıcısı', desc: 'UGOS\'u 365 gün kullandınız', icon: Crown, req: 365, type: 'usage_days', xp: 2000, rarity: 'legendary' },
        { id: 'early-adopter', name: 'Erken Benimseyici', desc: 'UGOS\'un ilk kullanıcılarındansınız', icon: Rocket, req: 1, type: 'early_user', xp: 500, rarity: 'epic' },
        { id: 'data-master', name: 'Veri Ustası', desc: '1000 veri noktası topladınız', icon: BarChart3, req: 1000, type: 'data_points', xp: 400, rarity: 'rare' }
      ]
    }
  };

  // Rarity colors and effects
  const rarityConfig = {
    common: { color: 'gray', glow: '', border: 'border-gray-300' },
    uncommon: { color: 'green', glow: 'shadow-green-500/20', border: 'border-green-400' },
    rare: { color: 'blue', glow: 'shadow-blue-500/30', border: 'border-blue-400' },
    epic: { color: 'purple', glow: 'shadow-purple-500/40', border: 'border-purple-400' },
    legendary: { color: 'yellow', glow: 'shadow-yellow-500/50', border: 'border-yellow-400' }
  };

  // Check if badge is unlocked
  const checkBadgeUnlocked = (badge, stats) => {
    switch (badge.type) {
      case 'tasks_completed': return stats.completedTasks >= badge.req;
      case 'focus_minutes': return stats.totalFocusMinutes >= badge.req;
      case 'workouts_completed': return stats.totalWorkouts >= badge.req;
      case 'books_read': return stats.totalBooks >= badge.req;
      case 'meditation_minutes': return stats.totalMeditationMinutes >= badge.req;
      case 'habits_created': return stats.totalHabits >= badge.req;
      case 'goals_completed': return stats.completedGoals >= badge.req;
      case 'usage_days': return stats.usageDays >= badge.req;
      case 'meditation_sessions': return meditationData.length >= badge.req;
      case 'focus_sessions': return focusEntries.length >= badge.req;
      default: return false;
    }
  };

  // Calculate user statistics
  const userStats = useMemo(() => {
    const stats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.completed).length,
      totalFocusMinutes: focusEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0),
      totalWorkouts: workouts.length,
      totalBooks: booksRead.length,
      totalMeditationMinutes: meditationData.reduce((sum, session) => sum + (session.duration || 0), 0),
      totalHabits: habits.length,
      totalGoals: goals.length,
      completedGoals: goals.filter(g => g.completed).length,
      usageDays: userData.usageDays || 1,
      currentStreak: userData.currentStreak || 0,
      longestStreak: userData.longestStreak || 0
    };

    // Calculate level and XP
    const totalXP = Object.values(badgeCategories).reduce((total, category) => {
      return total + category.badges.reduce((catTotal, badge) => {
        const isUnlocked = checkBadgeUnlocked(badge, stats);
        return catTotal + (isUnlocked ? badge.xp : 0);
      }, 0);
    }, 0);

    const level = Math.floor(totalXP / 1000) + 1;
    const currentLevelXP = totalXP % 1000;
    const nextLevelXP = 1000;

    return { ...stats, totalXP, level, currentLevelXP, nextLevelXP };
  }, [tasks, focusEntries, workouts, booksRead, meditationData, habits, goals, userData]);



  // Get badge progress
  const getBadgeProgress = (badge, stats) => {
    let current = 0;
    switch (badge.type) {
      case 'tasks_completed': current = stats.completedTasks; break;
      case 'focus_minutes': current = stats.totalFocusMinutes; break;
      case 'workouts_completed': current = stats.totalWorkouts; break;
      case 'books_read': current = stats.totalBooks; break;
      case 'meditation_minutes': current = stats.totalMeditationMinutes; break;
      case 'habits_created': current = stats.totalHabits; break;
      case 'goals_completed': current = stats.completedGoals; break;
      case 'usage_days': current = stats.usageDays; break;
      case 'meditation_sessions': current = meditationData.length; break;
      case 'focus_sessions': current = focusEntries.length; break;
      default: current = 0;
    }
    return Math.min(current / badge.req, 1);
  };

  // Filter and sort badges
  const getFilteredBadges = () => {
    let allBadges = [];
    
    Object.entries(badgeCategories).forEach(([categoryKey, category]) => {
      if (selectedCategory === 'all' || selectedCategory === categoryKey) {
        category.badges.forEach(badge => {
          const isUnlocked = checkBadgeUnlocked(badge, userStats);
          const progress = getBadgeProgress(badge, userStats);
          
          if (showUnlocked ? isUnlocked : !isUnlocked) {
            allBadges.push({
              ...badge,
              category: categoryKey,
              categoryName: category.name,
              categoryColor: category.color,
              isUnlocked,
              progress
            });
          }
        });
      }
    });

    // Filter by search term
    if (searchTerm) {
      allBadges = allBadges.filter(badge => 
        badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        badge.desc.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort badges
    allBadges.sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return b.progress - a.progress;
        case 'xp':
          return b.xp - a.xp;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rarity':
          const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        default:
          return 0;
      }
    });

    return allBadges;
  };

  // Toggle category expansion
  const toggleCategory = (categoryKey) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryKey)) {
      newExpanded.delete(categoryKey);
    } else {
      newExpanded.add(categoryKey);
    }
    setExpandedCategories(newExpanded);
  };

  // Badge component
  const BadgeCard = ({ badge }) => {
    const rarity = rarityConfig[badge.rarity];
    const IconComponent = badge.icon;
    const [showDetails, setShowDetails] = useState(false);
    
    return (
      <div className={`
        relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 shadow-lg
        ${badge.isUnlocked 
          ? `bg-gradient-to-br from-gray-700 to-gray-800 border-${rarity.color}-500 ${rarity.glow}` 
          : 'bg-gray-800/50 border-gray-600 opacity-70'
        }
        ${animatingBadges.has(badge.id) ? 'animate-pulse' : ''}
      `}>
        {/* Rarity indicator */}
        <div className={`absolute top-2 right-2 w-3 h-3 rounded-full bg-${rarity.color}-400 shadow-lg`} />
        
        {/* Badge icon */}
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-md
          ${badge.isUnlocked 
            ? `bg-${rarity.color}-500 text-white` 
            : 'bg-gray-600 text-gray-400'
          }
        `}>
          <IconComponent size={24} />
        </div>

        {/* Badge info */}
        <h3 className={`font-bold text-sm mb-1 ${badge.isUnlocked ? 'text-white' : 'text-gray-400'}`}>
          {badge.name}
        </h3>
        <p className={`text-xs mb-3 ${badge.isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
          {badge.desc}
        </p>

        {/* Requirements display */}
        <div className={`text-xs mb-3 p-2 rounded-lg ${badge.isUnlocked ? 'bg-gray-600/50' : 'bg-gray-700/50'}`}>
          <span className={`${badge.isUnlocked ? 'text-gray-300' : 'text-gray-400'}`}>
            Gereksinim: {badge.req} {badge.type === 'tasks_completed' ? 'görev' : 
                                   badge.type === 'focus_minutes' ? 'dakika odaklanma' :
                                   badge.type === 'workouts_completed' ? 'antrenman' :
                                   badge.type === 'books_read' ? 'kitap' :
                                   badge.type === 'meditation_minutes' ? 'dakika meditasyon' :
                                   badge.type === 'habits_created' ? 'alışkanlık' :
                                   badge.type === 'goals_completed' ? 'hedef' :
                                   badge.type === 'usage_days' ? 'gün kullanım' :
                                   badge.type === 'meditation_sessions' ? 'meditasyon seansı' :
                                   badge.type === 'focus_sessions' ? 'odaklanma seansı' : 'birim'}
          </span>
        </div>

        {/* How to earn section */}
        {badge.howToEarn && (
          <div className={`text-xs mb-3 p-2 rounded-lg border ${badge.isUnlocked ? 'bg-green-900/30 border-green-700' : 'bg-blue-900/30 border-blue-700'}`}>
            <div className="flex items-center mb-1">
              <Lightbulb size={12} className={`mr-1 ${badge.isUnlocked ? 'text-green-400' : 'text-blue-400'}`} />
              <span className={`font-medium ${badge.isUnlocked ? 'text-green-300' : 'text-blue-300'}`}>
                Nasıl Kazanılır:
              </span>
            </div>
            <p className={`${badge.isUnlocked ? 'text-green-200' : 'text-blue-200'}`}>
              {badge.howToEarn}
            </p>
          </div>
        )}

        {/* Tips section */}
        {badge.tips && !badge.isUnlocked && (
          <div className="text-xs mb-3 p-2 rounded-lg bg-yellow-900/30 border border-yellow-700">
            <div className="flex items-center mb-1">
              <Star size={12} className="mr-1 text-yellow-400" />
              <span className="font-medium text-yellow-300">İpucu:</span>
            </div>
            <p className="text-yellow-200">{badge.tips}</p>
          </div>
        )}

        {/* Progress bar */}
        {!badge.isUnlocked && (
          <div className="mb-2">
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className={`bg-${rarity.color}-400 h-2 rounded-full transition-all duration-500`}
                style={{ width: `${badge.progress * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {Math.round(badge.progress * 100)}% tamamlandı
            </p>
          </div>
        )}

        {/* XP reward */}
        <div className={`
          flex items-center justify-between text-xs
          ${badge.isUnlocked ? 'text-gray-300' : 'text-gray-500'}
        `}>
          <span className="flex items-center">
            <Star size={12} className="mr-1" />
            {badge.xp} XP
          </span>
          <span className={`capitalize text-${rarity.color}-400 font-medium`}>
            {badge.rarity}
          </span>
        </div>

        {/* Lock overlay for locked badges */}
        {!badge.isUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-xl">
            <Lock size={20} className="text-gray-400" />
          </div>
        )}
      </div>
    );
  };

  // Overview tab content
  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Level and XP */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Seviye {userStats.level}</h2>
            <p className="text-purple-200">Toplam {userStats.totalXP} XP</p>
          </div>
          <div className="text-right">
            <Trophy size={48} className="text-yellow-300" />
          </div>
        </div>
        
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Sonraki seviyeye</span>
            <span>{userStats.currentLevelXP}/{userStats.nextLevelXP} XP</span>
          </div>
          <div className="w-full bg-purple-500/30 rounded-full h-3">
            <div 
              className="bg-yellow-300 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(userStats.currentLevelXP / userStats.nextLevelXP) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Toplam Rozet</p>
              <p className="text-2xl font-bold text-white">
                {Object.values(badgeCategories).reduce((total, cat) => 
                  total + cat.badges.filter(badge => checkBadgeUnlocked(badge, userStats)).length, 0
                )}
              </p>
            </div>
            <Award className="text-yellow-500" size={24} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Tamamlanan Görev</p>
              <p className="text-2xl font-bold text-white">{userStats.completedTasks}</p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Odaklanma Saati</p>
              <p className="text-2xl font-bold text-white">{Math.round(userStats.totalFocusMinutes / 60)}</p>
            </div>
            <Brain className="text-purple-500" size={24} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Mevcut Seri</p>
              <p className="text-2xl font-bold text-white">{userStats.currentStreak}</p>
            </div>
            <Flame className="text-orange-500" size={24} />
          </div>
        </div>
      </div>

      {/* Recent achievements */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Sparkles className="mr-2 text-yellow-500" />
          Son Kazanılan Rozetler
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getFilteredBadges()
            .filter(badge => badge.isUnlocked)
            .slice(0, 3)
            .map(badge => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
        </div>
      </div>

      {/* Category overview */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">Kategori Durumu</h3>
        <div className="space-y-3">
          {Object.entries(badgeCategories).map(([key, category]) => {
            const totalBadges = category.badges.length;
            const unlockedBadges = category.badges.filter(badge => checkBadgeUnlocked(badge, userStats)).length;
            const progress = (unlockedBadges / totalBadges) * 100;
            const IconComponent = category.icon;

            return (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full bg-${category.color}-500 flex items-center justify-center mr-3`}>
                    <IconComponent size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{category.name}</h4>
                    <p className="text-sm text-gray-400">{unlockedBadges}/{totalBadges} rozet • {category.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{Math.round(progress)}%</p>
                  <div className="w-20 bg-gray-600 rounded-full h-2 mt-1">
                    <div 
                      className={`bg-${category.color}-500 h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Badges tab content
  const BadgesContent = () => (
    <div className="space-y-6">
      {/* Filters and search */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rozet ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">Tüm Kategoriler</option>
            {Object.entries(badgeCategories).map(([key, category]) => (
              <option key={key} value={key}>{category.name}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="progress">İlerleme</option>
            <option value="xp">XP Değeri</option>
            <option value="name">İsim</option>
            <option value="rarity">Nadir</option>
          </select>

          {/* Show unlocked toggle */}
          <button
            onClick={() => setShowUnlocked(!showUnlocked)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showUnlocked 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            {showUnlocked ? 'Kazanılan' : 'Kilitli'}
          </button>
        </div>
      </div>

      {/* Category sections */}
      {selectedCategory === 'all' ? (
        <div className="space-y-8">
          {Object.entries(badgeCategories).map(([categoryKey, category]) => {
            const categoryBadges = category.badges.map(badge => {
              const isUnlocked = checkBadgeUnlocked(badge, userStats);
              const progress = getBadgeProgress(badge, userStats);
              return {
                ...badge,
                category: categoryKey,
                categoryName: category.name,
                categoryColor: category.color,
                isUnlocked,
                progress
              };
            }).filter(badge => showUnlocked ? badge.isUnlocked : !badge.isUnlocked);

            if (categoryBadges.length === 0) return null;

            const IconComponent = category.icon;
            const totalBadges = category.badges.length;
            const unlockedBadges = category.badges.filter(badge => checkBadgeUnlocked(badge, userStats)).length;
            const categoryProgress = (unlockedBadges / totalBadges) * 100;

            return (
              <div key={categoryKey} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                {/* Category header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full bg-${category.color}-500 flex items-center justify-center mr-4 shadow-lg`}>
                      <IconComponent size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{category.name}</h3>
                      <p className="text-gray-400">{category.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{unlockedBadges}/{totalBadges}</p>
                    <div className="w-24 bg-gray-600 rounded-full h-2 mt-1">
                      <div 
                        className={`bg-${category.color}-500 h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${categoryProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Category badges */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categoryBadges.map(badge => (
                    <BadgeCard key={badge.id} badge={badge} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Single category view */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {getFilteredBadges().map(badge => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      )}

      {getFilteredBadges().length === 0 && (
        <div className="text-center py-12">
          <Trophy size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">Rozet bulunamadı</h3>
          <p className="text-gray-500">Arama kriterlerinizi değiştirmeyi deneyin.</p>
        </div>
      )}
    </div>
  );

  // Statistics tab content
  const StatisticsContent = () => (
    <div className="space-y-6">
      {/* Detailed stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <Target className="mr-2 text-blue-500" />
            Görevler
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Toplam</span>
              <span className="font-medium text-white">{userStats.totalTasks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tamamlanan</span>
              <span className="font-medium text-green-400">{userStats.completedTasks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Başarı Oranı</span>
              <span className="font-medium text-white">
                {userStats.totalTasks > 0 ? Math.round((userStats.completedTasks / userStats.totalTasks) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <Brain className="mr-2 text-purple-500" />
            Odaklanma
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Toplam Saat</span>
              <span className="font-medium text-white">{Math.round(userStats.totalFocusMinutes / 60)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Oturum Sayısı</span>
              <span className="font-medium text-white">{focusEntries.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Ortalama Süre</span>
              <span className="font-medium text-white">
                {focusEntries.length > 0 ? Math.round(userStats.totalFocusMinutes / focusEntries.length) : 0} dk
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <Heart className="mr-2 text-red-500" />
            Sağlık
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Antrenman</span>
              <span className="font-medium text-white">{userStats.totalWorkouts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Meditasyon (saat)</span>
              <span className="font-medium text-white">{Math.round(userStats.totalMeditationMinutes / 60)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Okunan Kitap</span>
              <span className="font-medium text-white">{userStats.totalBooks}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress charts placeholder */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <BarChart3 className="mr-2 text-green-500" />
          İlerleme Grafiği
        </h3>
        <div className="h-64 flex items-center justify-center bg-gray-700/50 rounded-lg">
          <div className="text-center">
            <BarChart3 size={48} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-400">Grafik verileri yükleniyor...</p>
          </div>
        </div>
      </div>

      {/* Streaks */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Flame className="mr-2 text-orange-500" />
          Seriler
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-orange-500/20 rounded-lg border border-orange-500/30">
            <Flame size={32} className="mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold text-white">{userStats.currentStreak}</p>
            <p className="text-sm text-gray-400">Mevcut Seri</p>
          </div>
          <div className="text-center p-4 bg-red-500/20 rounded-lg border border-red-500/30">
            <Trophy size={32} className="mx-auto text-red-500 mb-2" />
            <p className="text-2xl font-bold text-white">{userStats.longestStreak}</p>
            <p className="text-sm text-gray-400">En Uzun Seri</p>
          </div>
          <div className="text-center p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <Calendar size={32} className="mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-white">{userStats.usageDays}</p>
            <p className="text-sm text-gray-400">Kullanım Günü</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
          Başarılar Sistemi
        </h1>
        <p className="text-gray-400">İlerlemenizi takip edin ve rozetler kazanın</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Genel Bakış', icon: BarChart3 },
              { id: 'badges', name: 'Rozetler', icon: Award },
              { id: 'statistics', name: 'İstatistikler', icon: TrendingUp }
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center py-3 px-4 border-b-2 font-medium text-sm transition-all duration-200 rounded-t-lg
                    ${activeTab === tab.id
                      ? 'border-purple-500 text-purple-400 bg-gray-800/50'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600 hover:bg-gray-800/30'
                    }
                  `}
                >
                  <IconComponent size={20} className="mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <div className="min-h-screen">
        {activeTab === 'overview' && <OverviewContent />}
        {activeTab === 'badges' && <BadgesContent />}
        {activeTab === 'statistics' && <StatisticsContent />}
      </div>
    </div>
  );
};

export default AchievementSystem;