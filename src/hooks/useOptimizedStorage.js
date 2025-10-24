import { useState, useEffect, useCallback, useRef } from 'react';
import { persistentCache, memoryCache } from '../utils/cache';

// Optimized localStorage hook with caching and batching
export const useOptimizedStorage = (key, initialValue, options = {}) => {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    debounceMs = 500,
    enableCache = true,
    ttl = 30 * 60 * 1000, // 30 minutes default
    enableCompression = false
  } = options;

  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Try cache first if enabled
      if (enableCache) {
        const cached = memoryCache.get(key);
        if (cached !== null) {
          return cached;
        }

        const persistentCached = persistentCache.get(key);
        if (persistentCached !== null) {
          memoryCache.set(key, persistentCached, ttl);
          return persistentCached;
        }
      }

      // Fallback to localStorage
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = deserialize(item);
        if (enableCache) {
          memoryCache.set(key, parsed, ttl);
          persistentCache.set(key, parsed, ttl);
        }
        return parsed;
      }
      
      return initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const timeoutRef = useRef(null);
  const pendingValueRef = useRef(null);

  // Debounced save function
  const debouncedSave = useCallback((value) => {
    pendingValueRef.current = value;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        const valueToSave = pendingValueRef.current;
        const serialized = serialize(valueToSave);
        
        // Save to localStorage
        window.localStorage.setItem(key, serialized);
        
        // Update caches if enabled
        if (enableCache) {
          memoryCache.set(key, valueToSave, ttl);
          persistentCache.set(key, valueToSave, ttl);
        }
        
        // Dispatch storage event for cross-tab sync
        window.dispatchEvent(new StorageEvent('storage', {
          key,
          newValue: serialized,
          oldValue: window.localStorage.getItem(key)
        }));
        
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    }, debounceMs);
  }, [key, serialize, debounceMs, enableCache, ttl]);

  // Set value function
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to storage (debounced)
      debouncedSave(valueToStore);
      
    } catch (error) {
      console.error(`Error setting value for key "${key}":`, error);
    }
  }, [key, storedValue, debouncedSave]);

  // Listen for storage changes (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = deserialize(e.newValue);
          setStoredValue(newValue);
          
          // Update caches
          if (enableCache) {
            memoryCache.set(key, newValue, ttl);
            persistentCache.set(key, newValue, ttl);
          }
        } catch (error) {
          console.warn(`Error parsing storage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize, enableCache, ttl]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [storedValue, setValue];
};

// Batch operations for multiple localStorage operations
export const useBatchedStorage = () => {
  const batchRef = useRef([]);
  const timeoutRef = useRef(null);

  const addToBatch = useCallback((key, value, serialize = JSON.stringify) => {
    batchRef.current.push({ key, value, serialize });
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const batch = batchRef.current;
      batchRef.current = [];

      // Process batch
      batch.forEach(({ key, value, serialize }) => {
        try {
          window.localStorage.setItem(key, serialize(value));
        } catch (error) {
          console.error(`Batch storage error for key "${key}":`, error);
        }
      });
    }, 100); // 100ms batch window
  }, []);

  const flushBatch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const batch = batchRef.current;
    batchRef.current = [];

    batch.forEach(({ key, value, serialize }) => {
      try {
        window.localStorage.setItem(key, serialize(value));
      } catch (error) {
        console.error(`Batch storage error for key "${key}":`, error);
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { addToBatch, flushBatch };
};

// Storage quota management
export const useStorageQuota = () => {
  const [quota, setQuota] = useState({ used: 0, available: 0, percentage: 0 });

  const calculateQuota = useCallback(async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const available = estimate.quota || 0;
        const percentage = available > 0 ? (used / available) * 100 : 0;
        
        setQuota({ used, available, percentage });
      } else {
        // Fallback: estimate localStorage usage
        let totalSize = 0;
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            totalSize += localStorage[key].length + key.length;
          }
        }
        
        // Rough estimate: most browsers allow 5-10MB for localStorage
        const estimatedQuota = 5 * 1024 * 1024; // 5MB
        const percentage = (totalSize / estimatedQuota) * 100;
        
        setQuota({ 
          used: totalSize, 
          available: estimatedQuota, 
          percentage: Math.min(percentage, 100) 
        });
      }
    } catch (error) {
      console.warn('Storage quota calculation failed:', error);
    }
  }, []);

  useEffect(() => {
    calculateQuota();
    
    // Recalculate periodically
    const interval = setInterval(calculateQuota, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [calculateQuota]);

  const cleanupOldData = useCallback((maxAge = 7 * 24 * 60 * 60 * 1000) => {
    const now = Date.now();
    const keysToRemove = [];

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        try {
          const item = JSON.parse(localStorage[key]);
          if (item.timestamp && (now - item.timestamp) > maxAge) {
            keysToRemove.push(key);
          }
        } catch (error) {
          // If parsing fails, it might be old data without timestamp
          // Consider removing it if quota is high
          if (quota.percentage > 80) {
            keysToRemove.push(key);
          }
        }
      }
    }

    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Failed to remove old data for key "${key}":`, error);
      }
    });

    calculateQuota(); // Recalculate after cleanup
    return keysToRemove.length;
  }, [quota.percentage, calculateQuota]);

  return { quota, calculateQuota, cleanupOldData };
};

// Compression utilities for large data
export const compressionUtils = {
  // Simple LZ-string like compression
  compress: (str) => {
    const dict = {};
    const data = (str + "").split("");
    const out = [];
    let currChar;
    let phrase = data[0];
    let code = 256;
    
    for (let i = 1; i < data.length; i++) {
      currChar = data[i];
      if (dict[phrase + currChar] != null) {
        phrase += currChar;
      } else {
        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
        dict[phrase + currChar] = code;
        code++;
        phrase = currChar;
      }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    
    return out.join(',');
  },

  decompress: (str) => {
    const dict = {};
    const data = str.split(',').map(Number);
    let currChar = String.fromCharCode(data[0]);
    let oldPhrase = currChar;
    const out = [currChar];
    let code = 256;
    let phrase;
    
    for (let i = 1; i < data.length; i++) {
      const currCode = data[i];
      if (currCode < 256) {
        phrase = String.fromCharCode(currCode);
      } else {
        phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
      }
      out.push(phrase);
      currChar = phrase.charAt(0);
      dict[code] = oldPhrase + currChar;
      code++;
      oldPhrase = phrase;
    }
    
    return out.join('');
  }
};

export default useOptimizedStorage;