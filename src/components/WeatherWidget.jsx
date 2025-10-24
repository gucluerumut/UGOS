import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Eye, Droplets, Thermometer, MapPin, RefreshCw } from 'lucide-react';

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ lat: null, lon: null, city: 'İstanbul' });

  // Weather icons mapping
  const getWeatherIcon = (condition, isDay = true) => {
    const iconProps = { size: 24, className: "text-blue-400" };
    
    switch (condition?.toLowerCase()) {
      case 'clear':
        return isDay ? <Sun {...iconProps} className="text-yellow-400" /> : <Sun {...iconProps} className="text-blue-300" />;
      case 'clouds':
      case 'cloudy':
        return <Cloud {...iconProps} className="text-gray-400" />;
      case 'rain':
      case 'drizzle':
        return <CloudRain {...iconProps} className="text-blue-500" />;
      case 'snow':
        return <CloudSnow {...iconProps} className="text-white" />;
      case 'wind':
        return <Wind {...iconProps} className="text-gray-300" />;
      default:
        return <Cloud {...iconProps} />;
    }
  };

  // Get user location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            city: 'Mevcut Konum'
          });
        },
        (error) => {
          console.log('Konum alınamadı:', error);
          // Fallback to Istanbul coordinates
          setLocation({
            lat: 41.0082,
            lon: 28.9784,
            city: 'İstanbul'
          });
        }
      );
    }
  };

  // Fetch weather data using Open-Meteo API (free, no API key required)
  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);

      const { lat, lon } = location;
      
      if (!lat || !lon) {
        throw new Error('Konum bilgisi bulunamadı');
      }

      // Use Open-Meteo API for current weather
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&timezone=auto`
      );

      if (!response.ok) {
        throw new Error('Hava durumu servisi şu anda kullanılamıyor');
      }

      const data = await response.json();
      const current = data.current;
      
      // Convert weather code to condition
      const getWeatherCondition = (code) => {
        if (code === 0) return { main: 'Clear', description: 'Açık hava' };
        if (code <= 3) return { main: 'Clouds', description: 'Bulutlu' };
        if (code <= 67) return { main: 'Rain', description: 'Yağmurlu' };
        if (code <= 77) return { main: 'Snow', description: 'Karlı' };
        if (code <= 82) return { main: 'Rain', description: 'Sağanak' };
        return { main: 'Clouds', description: 'Kapalı' };
      };

      const weatherCondition = getWeatherCondition(current.weather_code);

      // Get current time for sunrise/sunset calculation
      const now = new Date();
      const sunrise = new Date(now);
      sunrise.setHours(6, 30, 0, 0); // Approximate sunrise
      const sunset = new Date(now);
      sunset.setHours(18, 30, 0, 0); // Approximate sunset

      setWeather({
        name: location.city,
        main: {
          temp: Math.round(current.temperature_2m),
          feels_like: Math.round(current.apparent_temperature),
          humidity: Math.round(current.relative_humidity_2m),
          pressure: Math.round(current.surface_pressure)
        },
        weather: [{
          main: weatherCondition.main,
          description: weatherCondition.description,
          icon: '01d'
        }],
        wind: {
          speed: Math.round(current.wind_speed_10m / 3.6), // Convert km/h to m/s
          deg: Math.round(current.wind_direction_10m)
        },
        visibility: 10000, // Default visibility
        sys: {
          sunrise: sunrise.getTime(),
          sunset: sunset.getTime()
        }
      });

      console.log('Weather data fetched successfully:', {
        temp: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        location: location.city
      });

    } catch (err) {
      setError(err.message);
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (location.lat && location.lon) {
      fetchWeather();
    }
  }, [location]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="animate-spin text-blue-400" size={24} />
          <span className="ml-2 text-gray-300">Hava durumu yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-900/50 to-orange-900/50 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
        <div className="text-center">
          <Cloud className="mx-auto mb-2 text-red-400" size={32} />
          <p className="text-red-300 text-sm">{error}</p>
          <button
            onClick={fetchWeather}
            className="mt-2 px-3 py-1 bg-red-600/50 hover:bg-red-600/70 rounded-lg text-sm transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const isDay = Date.now() > weather.sys.sunrise && Date.now() < weather.sys.sunset;

  return (
    <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-blue-400" />
          <span className="text-gray-300 text-sm font-medium">{weather.name}</span>
        </div>
        <button
          onClick={fetchWeather}
          className="p-1 hover:bg-blue-600/30 rounded-lg transition-colors"
          title="Yenile"
        >
          <RefreshCw size={16} className="text-blue-400" />
        </button>
      </div>

      {/* Main Weather Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getWeatherIcon(weather.weather[0].main, isDay)}
          <div>
            <div className="text-2xl font-bold text-white">
              {weather.main.temp}°C
            </div>
            <div className="text-sm text-gray-400 capitalize">
              {weather.weather[0].description}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Hissedilen</div>
          <div className="text-lg font-semibold text-gray-300">
            {weather.main.feels_like}°C
          </div>
        </div>
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Droplets size={16} className="text-blue-400" />
          <span className="text-gray-400">Nem:</span>
          <span className="text-white font-medium">{weather.main.humidity}%</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Wind size={16} className="text-gray-400" />
          <span className="text-gray-400">Rüzgar:</span>
          <span className="text-white font-medium">{weather.wind.speed} m/s</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Thermometer size={16} className="text-red-400" />
          <span className="text-gray-400">Basınç:</span>
          <span className="text-white font-medium">{weather.main.pressure} hPa</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-green-400" />
          <span className="text-gray-400">Görüş:</span>
          <span className="text-white font-medium">{(weather.visibility / 1000).toFixed(1)} km</span>
        </div>
      </div>

      {/* Sun Times */}
      <div className="mt-4 pt-3 border-t border-gray-700/50">
        <div className="flex justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Sun size={12} className="text-yellow-400" />
            <span>Gündoğumu: {formatTime(weather.sys.sunrise)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Sun size={12} className="text-orange-400" />
            <span>Günbatımı: {formatTime(weather.sys.sunset)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;