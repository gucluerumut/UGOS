import { useState, useEffect } from 'react';
import motivationalQuotesData from '../data/motivationalQuotes.json';

const useMotivationalQuotes = () => {
  const [currentQuote, setCurrentQuote] = useState(null);
  const [quotesData, setQuotesData] = useState(motivationalQuotesData);
  const [isLoading, setIsLoading] = useState(true);

  // Expand quotes to ~100 using lightweight generator
  useEffect(() => {
    try {
      const base = motivationalQuotesData;
      const baseMaxId = base.quotes.reduce((m, q) => Math.max(m, q.id || 0), 0);
      const categories = Array.isArray(base.categories) && base.categories.length ? base.categories : ['motivasyon'];
      const templates = [
        "Bugün bir adım at; yarın iki adım daha.",
        "Disiplin, hedef ile başarı arasındaki köprüdür.",
        "Küçük ilerlemeler, büyük sonuçların habercisidir.",
        "Odaklan; zaman senin en değerli varlığındır.",
        "Her gün %1 gelişim, yılda büyük dönüşüm.",
        "Başlamak, başarmanın yarısıdır.",
        "Zor olan her şey, yapılana kadar imkansız görünür.",
        "Tutarlılık, yetenekten daha çok kazandırır.",
        "Planla, uygula, değerlendir, optimize et.",
        "Bugün yaptığın seçimler yarınki hayatını belirler."
      ];

      const needCount = Math.max(0, 100 - base.quotes.length);
      const syntheticQuotes = Array.from({ length: needCount }).map((_, i) => ({
        id: baseMaxId + i + 1,
        text: templates[i % templates.length],
        author: "UGOS",
        category: categories[i % categories.length],
        language: "tr"
      }));

      if (needCount > 0) {
        setQuotesData({ ...base, quotes: [...base.quotes, ...syntheticQuotes] });
      }
    } catch (e) {
      // Fallback to base data on any error
      setQuotesData(motivationalQuotesData);
    }
  }, []);

  // Günün tarihini al (YYYY-MM-DD formatında)
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Günün saatini al (HH formatında)
  const getCurrentHour = () => {
    return new Date().getHours();
  };

  // Zaman dilimini belirle (sabah, öğle, akşam)
  const getTimeSlot = () => {
    const hour = getCurrentHour();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
  };

  // Günlük rotasyon için index hesapla
  const calculateDailyIndex = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((today - startOfYear) / (24 * 60 * 60 * 1000)) + 1;
    return dayOfYear % quotesData.quotes.length;
  };

  // Zaman bazlı index hesapla (günde 3 farklı söz)
  const calculateTimeBasedIndex = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((today - startOfYear) / (24 * 60 * 60 * 1000)) + 1;
    const timeSlot = getTimeSlot();
    
    let timeMultiplier = 0;
    if (timeSlot === 'morning') timeMultiplier = 0;
    else if (timeSlot === 'afternoon') timeMultiplier = 1;
    else timeMultiplier = 2;
    
    return (dayOfYear * 3 + timeMultiplier) % quotesData.quotes.length;
  };

  // Rastgele söz seç
  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotesData.quotes.length);
    return quotesData.quotes[randomIndex];
  };

  // Kategoriye göre söz seç
  const getQuoteByCategory = (category) => {
    const filteredQuotes = quotesData.quotes.filter(quote => 
      quote.category.toLowerCase() === category.toLowerCase()
    );
    if (filteredQuotes.length === 0) return getRandomQuote();
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    return filteredQuotes[randomIndex];
  };

  // Günlük söz al (zaman bazlı otomatik rotasyon ile)
  const getDailyQuote = () => {
    const todayDate = getTodayDate();
    const currentTimeSlot = getTimeSlot();
    const storedData = localStorage.getItem('dailyQuote');
    
    if (storedData) {
      const parsed = JSON.parse(storedData);
      if (parsed.date === todayDate && parsed.timeSlot === currentTimeSlot) {
        return parsed.quote;
      }
    }

    // Zaman bazlı yeni söz seç
    const timeBasedIndex = calculateTimeBasedIndex();
    const dailyQuote = quotesData.quotes[timeBasedIndex];
    
    // Local storage'a kaydet
    localStorage.setItem('dailyQuote', JSON.stringify({
      date: todayDate,
      timeSlot: currentTimeSlot,
      quote: dailyQuote,
      index: timeBasedIndex
    }));

    return dailyQuote;
  };

  // Disiplin seviyesine göre söz seç
  const getMotivationalQuoteByMood = (mood) => {
    let targetCategories = [];
    
    switch (mood) {
      case 'low':
        targetCategories = ['motivasyon', 'azim', 'başarı', 'özgüven'];
        break;
      case 'medium':
        targetCategories = ['hedefler', 'gelişim', 'başarı', 'hayaller'];
        break;
      case 'high':
        targetCategories = ['başarı', 'inovasyon', 'potansiyel', 'gelecek'];
        break;
      default:
        return getRandomQuote();
    }

    const filteredQuotes = quotesData.quotes.filter(quote => 
      targetCategories.includes(quote.category.toLowerCase())
    );
    
    if (filteredQuotes.length === 0) return getRandomQuote();
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    return filteredQuotes[randomIndex];
  };

  // Söz favorilere ekle/çıkar
  const toggleFavorite = (quoteId) => {
    const favorites = JSON.parse(localStorage.getItem('favoriteQuotes') || '[]');
    const isAlreadyFavorite = favorites.includes(quoteId);
    
    let updatedFavorites;
    if (isAlreadyFavorite) {
      updatedFavorites = favorites.filter(id => id !== quoteId);
    } else {
      updatedFavorites = [...favorites, quoteId];
    }
    
    localStorage.setItem('favoriteQuotes', JSON.stringify(updatedFavorites));
    return !isAlreadyFavorite;
  };

  // Favori sözleri al
  const getFavoriteQuotes = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteQuotes') || '[]');
    return quotesData.quotes.filter(quote => favorites.includes(quote.id));
  };

  // Söz istatistikleri
  const getQuoteStats = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteQuotes') || '[]');
    const categories = [...new Set(quotesData.quotes.map(quote => quote.category))];
    
    return {
      totalQuotes: quotesData.quotes.length,
      favoriteCount: favorites.length,
      categories: categories.length,
      languageDistribution: {
        turkish: quotesData.quotes.filter(q => q.language === 'tr').length,
        english: quotesData.quotes.filter(q => q.language === 'en').length
      }
    };
  };

  // Söz arama
  const searchQuotes = (searchTerm) => {
    if (!searchTerm.trim()) return quotesData.quotes;
    
    const term = searchTerm.toLowerCase();
    return quotesData.quotes.filter(quote => 
      quote.text.toLowerCase().includes(term) ||
      quote.author.toLowerCase().includes(term) ||
      quote.category.toLowerCase().includes(term)
    );
  };

  // Component mount olduğunda günlük söz yükle ve otomatik kontrol başlat
  useEffect(() => {
    const loadDailyQuote = () => {
      setIsLoading(true);
      try {
        const dailyQuote = getDailyQuote();
        setCurrentQuote(dailyQuote);
      } catch (error) {
        console.error('Error loading daily quote:', error);
        setCurrentQuote(getRandomQuote());
      } finally {
        setIsLoading(false);
      }
    };

    // İlk yükleme
    loadDailyQuote();

    // Her 5 dakikada bir zaman dilimi değişikliğini kontrol et
    const timeCheckInterval = setInterval(() => {
      const currentQuoteData = localStorage.getItem('dailyQuote');
      if (currentQuoteData) {
        const parsed = JSON.parse(currentQuoteData);
        const currentTimeSlot = getTimeSlot();
        
        // Eğer zaman dilimi değiştiyse yeni söz yükle
        if (parsed.timeSlot !== currentTimeSlot) {
          const newQuote = getDailyQuote();
          setCurrentQuote(newQuote);
        }
      }
    }, 5 * 60 * 1000); // 5 dakika

    // Cleanup function
    return () => {
      clearInterval(timeCheckInterval);
    };
  }, [quotesData]);

  return {
    currentQuote,
    isLoading,
    quotesData,
    
    // Quote selection methods
    getDailyQuote,
    getRandomQuote,
    getQuoteByCategory,
    getMotivationalQuoteByMood,
    
    // Favorite management
    toggleFavorite,
    getFavoriteQuotes,
    
    // Utility methods
    getQuoteStats,
    searchQuotes,
    
    // Manual quote setting
    setCurrentQuote,
    
    // Available categories
    categories: quotesData.categories
  };
};

export default useMotivationalQuotes;