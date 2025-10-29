import { useState, useEffect } from 'react';
import motivationalQuotesData from '../data/motivationalQuotes.json';
// Import user-provided quotes as raw text; we'll sanitize and parse
import ugosQuotesRaw from './UGOS_Sözler.txt?raw';

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
      // Try to parse UGOS_Sözler.txt content (expected JSON array). It may contain multiple arrays or minor syntax issues.
      const sanitizeAndParseUgos = (raw) => {
        if (!raw || typeof raw !== 'string') return [];
        let content = raw.trim();
        // Merge adjacent arrays: "]\s*\[" -> ","
        content = content.replace(/\]\s*\[/g, ',');
        // Remove trailing commas before closing brackets
        content = content.replace(/,\s*\]/g, ']');
        content = content.replace(/\[\s*,/g, '[');
        // Ensure it starts with '[' and ends with ']'
        if (!content.startsWith('[')) content = `[${content}`;
        if (!content.endsWith(']')) content = `${content}]`;
        try {
          const parsed = JSON.parse(content);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          // Fallback: attempt to extract JSON objects via regex and parse individually
          const objects = [];
          const objRegex = /\{[\s\S]*?\}/g;
          const matches = content.match(objRegex) || [];
          for (const m of matches) {
            try { objects.push(JSON.parse(m)); } catch (_) { /* skip malformed */ }
          }
          return objects;
        }
      };

      const normalizeCategory = (cat) => {
        if (!cat) return 'motivasyon';
        const c = cat.toLowerCase();
        if (c.includes('islam')) return 'islam';
        if (c.includes('sufi') || c.includes('tasavvuf')) return 'islam';
        if (c.includes('felsefe') || c.includes('philosophy')) return 'felsefe';
        return cat;
      };

      const ugosParsed = sanitizeAndParseUgos(ugosQuotesRaw);
      const ugosNormalized = ugosParsed.map((q, i) => {
        const originalText = (q.text && String(q.text).trim()) || '';
        const turkishText = (q.textTr && String(q.textTr).trim()) || '';
        const displayText = turkishText || originalText;
        return {
          id: baseMaxId + i + 1,
          // default display text keeps existing behavior
          text: displayText,
          // preserve bilingual fields for UI toggle
          originalText,
          turkishText,
          author: q.author || 'Anonim',
          category: normalizeCategory(q.category),
          language: (turkishText ? 'tr' : (q.language || 'tr'))
        };
      }).filter(q => q.text && q.author);
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

      // Merge base quotes with UGOS quotes first
      let mergedQuotes = [...base.quotes, ...ugosNormalized];
      const needCount = Math.max(0, 100 - mergedQuotes.length);
      const syntheticQuotes = Array.from({ length: needCount }).map((_, i) => ({
        id: baseMaxId + ugosNormalized.length + i + 1,
        text: templates[i % templates.length],
        author: "UGOS",
        category: categories[i % categories.length],
        language: "tr"
      }));

      if (needCount > 0) {
        mergedQuotes = [...mergedQuotes, ...syntheticQuotes];
      }

      // Ensure categories include our normalized tags and external source tag
      const mergedCategories = Array.from(new Set([...(base.categories || []), 'islam', 'felsefe', 'zenquotes']));
      setQuotesData({ ...base, quotes: mergedQuotes, categories: mergedCategories });
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

  // 6 saatlik zaman dilimi belirle (0: 00-06, 1: 06-12, 2: 12-18, 3: 18-24)
  const getTimeSlot = () => {
    const hour = getCurrentHour();
    const slotIndex = Math.floor(hour / 6); // 0..3
    return `slot-${slotIndex}`; // string olarak sakla
  };

  // Günlük rotasyon için index hesapla
  const calculateDailyIndex = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((today - startOfYear) / (24 * 60 * 60 * 1000)) + 1;
    return dayOfYear % quotesData.quotes.length;
  };

  // Zaman bazlı index hesapla (günde 4 farklı söz, 6 saatlik periyot)
  const calculateTimeBasedIndex = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((today - startOfYear) / (24 * 60 * 60 * 1000)) + 1;
    const timeSlot = getTimeSlot();
    const slotIndex = Number(timeSlot.replace('slot-','')) || 0; // 0..3
    // Gün*4 + slotIndex ile deterministik ama gün içinde periyodik değişen index
    return (dayOfYear * 4 + slotIndex) % quotesData.quotes.length;
  };

  // ZenQuotes'tan söz al (slot bazlı cache ile, CORS destekli)
  const getZenQuoteCached = async () => {
    const todayDate = getTodayDate();
    const currentTimeSlot = getTimeSlot();
    const cacheKey = `zenQuote_${todayDate}_${currentTimeSlot}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.quote && parsed.date === todayDate && parsed.timeSlot === currentTimeSlot) {
          return parsed.quote;
        }
      }
    } catch (_) { /* ignore cache errors */ }

    try {
      const res = await fetch('https://zenquotes.io/api/random', { cache: 'no-store' });
      const data = await res.json();
      const item = Array.isArray(data) ? data[0] : data;
      const q = item?.q || '';
      const a = item?.a || 'Anonim';
      const remoteQuote = {
        id: Date.now(),
        text: q,
        originalText: q,
        turkishText: '',
        author: a,
        category: 'zenquotes',
        language: 'en'
      };
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ date: todayDate, timeSlot: currentTimeSlot, quote: remoteQuote }));
      } catch (_) { /* ignore */ }
      return remoteQuote;
    } catch (e) {
      // Ağ hatası veya rate-limit durumunda fallback olarak null dön
      return null;
    }
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

  // Günlük söz al (6 saatlik otomatik rotasyon ile)
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
      // Asenkron hibrid yükleme: tek slot Zen, çift slot yerel
      setIsLoading(true);
      (async () => {
        const todayDate = getTodayDate();
        const currentTimeSlot = getTimeSlot();
        const slotIndex = Number(currentTimeSlot.replace('slot-','')) || 0;
        let newQuote = null;
        if (slotIndex % 2 === 1) {
          newQuote = await getZenQuoteCached();
        }
        if (!newQuote) {
          const idx = calculateTimeBasedIndex();
          newQuote = quotesData.quotes[idx];
        }
        localStorage.setItem('dailyQuote', JSON.stringify({ date: todayDate, timeSlot: currentTimeSlot, quote: newQuote }));
        setCurrentQuote(newQuote);
        setIsLoading(false);
      })();
    };

    // İlk yükleme
    loadDailyQuote();

    // Her 5 dakikada bir 6 saatlik zaman dilimi değişikliğini kontrol et
    const timeCheckInterval = setInterval(() => {
      const currentQuoteData = localStorage.getItem('dailyQuote');
      if (currentQuoteData) {
        const parsed = JSON.parse(currentQuoteData);
        const currentTimeSlot = getTimeSlot();
        
        // Eğer zaman dilimi (6 saatlik slot) değiştiyse yeni söz yükle
        if (parsed.timeSlot !== currentTimeSlot) {
          // Slot değişti: hibrid güncelleme
          setIsLoading(true);
          (async () => {
            const slotIndex = Number(currentTimeSlot.replace('slot-','')) || 0;
            let newQuote = null;
            if (slotIndex % 2 === 1) {
              newQuote = await getZenQuoteCached();
            }
            if (!newQuote) {
              const idx = calculateTimeBasedIndex();
              newQuote = quotesData.quotes[idx];
            }
            localStorage.setItem('dailyQuote', JSON.stringify({ date: getTodayDate(), timeSlot: currentTimeSlot, quote: newQuote }));
            setCurrentQuote(newQuote);
            setIsLoading(false);
          })();
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