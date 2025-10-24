// Cache utility for intelligent caching strategy
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.expirationTimes = new Map();
    this.accessCounts = new Map();
    this.lastAccess = new Map();
    this.maxSize = 100; // Maximum cache entries
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
  }

  // Set cache with TTL (Time To Live)
  set(key, value, ttl = this.defaultTTL) {
    // Clean expired entries before adding new ones
    this.cleanExpired();
    
    // If cache is full, remove least recently used item
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const expirationTime = Date.now() + ttl;
    
    this.cache.set(key, value);
    this.expirationTimes.set(key, expirationTime);
    this.accessCounts.set(key, 1);
    this.lastAccess.set(key, Date.now());
    
    return true;
  }

  // Get cache value
  get(key) {
    // Check if key exists and not expired
    if (!this.cache.has(key)) {
      return null;
    }

    const expirationTime = this.expirationTimes.get(key);
    if (Date.now() > expirationTime) {
      this.delete(key);
      return null;
    }

    // Update access statistics
    this.accessCounts.set(key, (this.accessCounts.get(key) || 0) + 1);
    this.lastAccess.set(key, Date.now());
    
    return this.cache.get(key);
  }

  // Delete cache entry
  delete(key) {
    this.cache.delete(key);
    this.expirationTimes.delete(key);
    this.accessCounts.delete(key);
    this.lastAccess.delete(key);
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    this.expirationTimes.clear();
    this.accessCounts.clear();
    this.lastAccess.clear();
  }

  // Clean expired entries
  cleanExpired() {
    const now = Date.now();
    for (const [key, expirationTime] of this.expirationTimes.entries()) {
      if (now > expirationTime) {
        this.delete(key);
      }
    }
  }

  // Evict least recently used item
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, lastAccessTime] of this.lastAccess.entries()) {
      if (lastAccessTime < oldestTime) {
        oldestTime = lastAccessTime;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
      mostAccessed: this.getMostAccessed()
    };
  }

  // Calculate hit rate (simplified)
  calculateHitRate() {
    const totalAccesses = Array.from(this.accessCounts.values()).reduce((sum, count) => sum + count, 0);
    return totalAccesses > 0 ? (this.cache.size / totalAccesses) * 100 : 0;
  }

  // Get most accessed items
  getMostAccessed() {
    return Array.from(this.accessCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([key, count]) => ({ key, count }));
  }

  // Check if key exists and is valid
  has(key) {
    if (!this.cache.has(key)) {
      return false;
    }

    const expirationTime = this.expirationTimes.get(key);
    if (Date.now() > expirationTime) {
      this.delete(key);
      return false;
    }

    return true;
  }
}

// LocalStorage cache wrapper
class LocalStorageCache {
  constructor(prefix = 'ugos_cache_') {
    this.prefix = prefix;
  }

  set(key, value, ttl = 5 * 60 * 1000) {
    const item = {
      value,
      expiry: Date.now() + ttl,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.warn('LocalStorage cache set failed:', error);
      return false;
    }
  }

  get(key) {
    try {
      const itemStr = localStorage.getItem(this.prefix + key);
      if (!itemStr) {
        return null;
      }

      const item = JSON.parse(itemStr);
      
      // Check if expired
      if (Date.now() > item.expiry) {
        this.delete(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.warn('LocalStorage cache get failed:', error);
      return null;
    }
  }

  delete(key) {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.warn('LocalStorage cache delete failed:', error);
      return false;
    }
  }

  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.warn('LocalStorage cache clear failed:', error);
      return false;
    }
  }

  // Clean expired entries
  cleanExpired() {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          const itemStr = localStorage.getItem(key);
          if (itemStr) {
            const item = JSON.parse(itemStr);
            if (now > item.expiry) {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.warn('LocalStorage cache cleanup failed:', error);
    }
  }
}

// Create global instances
export const memoryCache = new CacheManager();
export const persistentCache = new LocalStorageCache();

// Utility functions
export const cacheUtils = {
  // Memoize function results
  memoize: (fn, keyGenerator = (...args) => JSON.stringify(args), ttl = 5 * 60 * 1000) => {
    return (...args) => {
      const key = keyGenerator(...args);
      
      // Try memory cache first
      let result = memoryCache.get(key);
      if (result !== null) {
        return result;
      }

      // Try persistent cache
      result = persistentCache.get(key);
      if (result !== null) {
        // Store in memory cache for faster access
        memoryCache.set(key, result, ttl);
        return result;
      }

      // Execute function and cache result
      result = fn(...args);
      memoryCache.set(key, result, ttl);
      persistentCache.set(key, result, ttl * 2); // Longer TTL for persistent cache
      
      return result;
    };
  },

  // Cache API responses
  cacheApiResponse: async (url, options = {}, ttl = 10 * 60 * 1000) => {
    const key = `api_${url}_${JSON.stringify(options)}`;
    
    // Check cache first
    let response = memoryCache.get(key);
    if (response) {
      return response;
    }

    response = persistentCache.get(key);
    if (response) {
      memoryCache.set(key, response, ttl);
      return response;
    }

    // Fetch and cache
    try {
      const fetchResponse = await fetch(url, options);
      const data = await fetchResponse.json();
      
      memoryCache.set(key, data, ttl);
      persistentCache.set(key, data, ttl * 2);
      
      return data;
    } catch (error) {
      console.error('API cache failed:', error);
      throw error;
    }
  },

  // Preload data
  preload: (key, dataLoader, ttl = 5 * 60 * 1000) => {
    if (!memoryCache.has(key) && !persistentCache.get(key)) {
      Promise.resolve(dataLoader()).then(data => {
        memoryCache.set(key, data, ttl);
        persistentCache.set(key, data, ttl * 2);
      }).catch(error => {
        console.warn('Preload failed for key:', key, error);
      });
    }
  },

  // Clean all caches
  cleanAll: () => {
    memoryCache.clear();
    persistentCache.clear();
  },

  // Clean expired entries from both caches
  cleanExpired: () => {
    memoryCache.cleanExpired();
    persistentCache.cleanExpired();
  }
};

// Auto cleanup every 5 minutes
setInterval(() => {
  cacheUtils.cleanExpired();
}, 5 * 60 * 1000);

export default cacheUtils;