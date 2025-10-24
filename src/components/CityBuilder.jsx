import React, { useState, useEffect } from 'react';
import { Building, Home, TreePine, Factory, School, Heart, ShoppingBag, Zap, Crown, Star, Route, MapPin, Car } from 'lucide-react';

const CityBuilder = ({ focusEntries }) => {
  const [cityLevel, setCityLevel] = useState(1);
  const [buildings, setBuildings] = useState([]);
  const [population, setPopulation] = useState(0);
  const [happiness, setHappiness] = useState(50);

  // Şehir seviyesi hesaplama
  const calculateCityLevel = () => {
    const totalFocusTime = focusEntries.reduce((sum, entry) => sum + entry.minutes, 0);
    return Math.floor(totalFocusTime / 60) + 1; // Her 60 dakika = 1 seviye
  };

  // Bina türleri ve gereksinimleri
  const buildingTypes = {
    road: {
      name: 'Yol',
      icon: Route,
      cost: 10, // dakika
      population: 0,
      happiness: 1,
      color: 'from-gray-400 to-gray-600',
      description: 'Temel yol - şehir bağlantısı'
    },
    mainStreet: {
      name: 'Ana Cadde',
      icon: Car,
      cost: 25,
      population: 0,
      happiness: 3,
      color: 'from-yellow-600 to-yellow-800',
      description: 'Geniş ana cadde - trafik akışı',
      requiredLevel: 2
    },
    house: {
      name: 'Ev',
      icon: Home,
      cost: 30, // dakika
      population: 4,
      happiness: 2,
      color: 'from-yellow-500 to-orange-500',
      description: '4 kişilik aile evi'
    },
    apartment: {
      name: 'Apartman',
      icon: Building,
      cost: 120,
      population: 20,
      happiness: 1,
      color: 'from-gray-500 to-gray-700',
      description: '20 kişilik apartman kompleksi',
      requiredLevel: 3
    },
    park: {
      name: 'Park',
      icon: TreePine,
      cost: 60,
      population: 0,
      happiness: 10,
      color: 'from-green-500 to-emerald-600',
      description: 'Şehir parkı - mutluluk artırır'
    },
    factory: {
      name: 'Fabrika',
      icon: Factory,
      cost: 180,
      population: 0,
      happiness: -5,
      color: 'from-red-500 to-red-700',
      description: 'Gelir sağlar ama mutluluk azaltır',
      requiredLevel: 5
    },
    school: {
      name: 'Okul',
      icon: School,
      cost: 150,
      population: 0,
      happiness: 8,
      color: 'from-blue-500 to-blue-700',
      description: 'Eğitim kurumu - mutluluk artırır',
      requiredLevel: 4
    },
    hospital: {
      name: 'Hastane',
      icon: Heart,
      cost: 200,
      population: 0,
      happiness: 12,
      color: 'from-red-400 to-pink-500',
      description: 'Sağlık hizmeti - yüksek mutluluk',
      requiredLevel: 6
    },
    mall: {
      name: 'AVM',
      icon: ShoppingBag,
      cost: 250,
      population: 0,
      happiness: 15,
      color: 'from-purple-500 to-purple-700',
      description: 'Alışveriş merkezi - çok yüksek mutluluk',
      requiredLevel: 8
    }
  };

  // Kullanılabilir focus zamanı hesaplama
  const getAvailableFocusTime = () => {
    const totalFocusTime = focusEntries.reduce((sum, entry) => sum + entry.minutes, 0);
    const usedTime = buildings.reduce((sum, building) => sum + buildingTypes[building.type].cost, 0);
    return totalFocusTime - usedTime;
  };

  // Bina inşa etme
  const buildBuilding = (type) => {
    const buildingType = buildingTypes[type];
    const availableTime = getAvailableFocusTime();
    
    if (availableTime >= buildingType.cost && cityLevel >= (buildingType.requiredLevel || 1)) {
      // Uygun pozisyon bulma
      let position;
      const isRoad = type === 'road' || type === 'mainStreet';
      
      if (isRoad) {
        // Yollar için uygun pozisyon bul (ana yol alanları)
        const roadPositions = [];
        for (let i = 0; i < 96; i++) {
          const row = Math.floor(i / 12);
          const col = i % 12;
          const isMainRoadArea = row === 3 || row === 4 || col === 5 || col === 6;
          if (isMainRoadArea && !buildings.find(b => b.position === i)) {
            roadPositions.push(i);
          }
        }
        position = roadPositions[Math.floor(Math.random() * roadPositions.length)];
      } else {
        // Binalar için uygun pozisyon bul (ana yol alanları dışında)
        const buildingPositions = [];
        for (let i = 0; i < 96; i++) {
          const row = Math.floor(i / 12);
          const col = i % 12;
          const isMainRoadArea = row === 3 || row === 4 || col === 5 || col === 6;
          if (!isMainRoadArea && !buildings.find(b => b.position === i)) {
            buildingPositions.push(i);
          }
        }
        position = buildingPositions[Math.floor(Math.random() * buildingPositions.length)];
      }
      
      if (position !== undefined) {
        const newBuilding = {
          id: Date.now(),
          type,
          builtAt: new Date().toISOString(),
          position
        };
        setBuildings(prev => [...prev, newBuilding]);
      }
    }
  };

  // Otomatik şehir gelişimi
  useEffect(() => {
    const totalFocusTime = focusEntries.reduce((sum, entry) => sum + entry.minutes, 0);
    const currentBuildingCount = buildings.length;
    
    // Her 30 dakika focus için otomatik bina ekle
    const expectedBuildings = Math.floor(totalFocusTime / 30);
    
    if (expectedBuildings > currentBuildingCount) {
      const buildingTypesArray = Object.keys(buildingTypes);
      const availableTypes = buildingTypesArray.filter(type => {
        const buildingType = buildingTypes[type];
        return cityLevel >= (buildingType.requiredLevel || 1);
      });
      
      if (availableTypes.length > 0) {
        // Önce yolları inşa et, sonra binaları
        const roadTypes = ['road', 'mainStreet'];
        const regularTypes = availableTypes.filter(type => !roadTypes.includes(type));
        
        const roadCount = buildings.filter(b => roadTypes.includes(b.type)).length;
        const buildingCount = buildings.filter(b => !roadTypes.includes(b.type)).length;
        
        let typeToAdd;
        if (roadCount < buildingCount / 3) {
          // Yol oranı düşükse yol ekle
          typeToAdd = roadTypes[Math.floor(Math.random() * roadTypes.length)];
        } else {
          // Normal bina ekle
          typeToAdd = regularTypes[Math.floor(Math.random() * regularTypes.length)];
        }
        
        if (typeToAdd) {
          buildBuilding(typeToAdd);
        }
      }
    }
  }, [focusEntries]);

  // Şehir istatistiklerini güncelleme
  useEffect(() => {
    const newCityLevel = calculateCityLevel();
    setCityLevel(newCityLevel);

    const newPopulation = buildings.reduce((sum, building) => 
      sum + buildingTypes[building.type].population, 0
    );
    setPopulation(newPopulation);

    const newHappiness = Math.max(0, Math.min(100, 
      50 + buildings.reduce((sum, building) => 
        sum + buildingTypes[building.type].happiness, 0
      )
    ));
    setHappiness(newHappiness);
  }, [focusEntries, buildings]);

  // Şehir seviyesi rengi
  const getCityLevelColor = () => {
    if (cityLevel >= 10) return 'from-purple-500 to-pink-500';
    if (cityLevel >= 7) return 'from-blue-500 to-purple-500';
    if (cityLevel >= 4) return 'from-green-500 to-blue-500';
    return 'from-yellow-500 to-green-500';
  };

  // Mutluluk seviyesi rengi
  const getHappinessColor = () => {
    if (happiness >= 80) return 'text-green-400';
    if (happiness >= 60) return 'text-yellow-400';
    if (happiness >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Şehir Başlığı ve İstatistikler */}
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
          🏙️ Focus Şehri
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`bg-gradient-to-r ${getCityLevelColor()} p-4 rounded-xl text-white`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown size={24} />
              <span className="font-semibold">Şehir Seviyesi</span>
            </div>
            <div className="text-3xl font-bold">{cityLevel}</div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-xl text-white">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Home size={24} />
              <span className="font-semibold">Nüfus</span>
            </div>
            <div className="text-3xl font-bold">{population.toLocaleString()}</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-xl text-white">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star size={24} />
              <span className="font-semibold">Mutluluk</span>
            </div>
            <div className={`text-3xl font-bold ${getHappinessColor()}`}>{happiness}%</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-xl text-white">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap size={24} />
              <span className="font-semibold">Kullanılabilir Zaman</span>
            </div>
            <div className="text-3xl font-bold">{getAvailableFocusTime()}</div>
            <div className="text-sm opacity-80">dakika</div>
          </div>
        </div>
      </div>

      {/* Şehir Görünümü */}
      <div className="bg-gradient-to-b from-sky-200 to-green-200 p-8 rounded-2xl min-h-[400px] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-green-300/30 to-transparent"></div>
        
        {/* Ana Yollar */}
        <div className="absolute inset-0 z-5">
          {/* Yatay ana cadde */}
          <div className="absolute top-1/2 left-0 right-0 h-4 bg-gray-600 transform -translate-y-1/2">
            <div className="h-full bg-yellow-400 opacity-30"></div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-yellow-300 transform -translate-y-1/2"></div>
          </div>
          
          {/* Dikey ana cadde */}
          <div className="absolute left-1/2 top-0 bottom-0 w-4 bg-gray-600 transform -translate-x-1/2">
            <div className="w-full bg-yellow-400 opacity-30"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-yellow-300 transform -translate-x-1/2"></div>
          </div>
        </div>
        
        {/* Binalar Grid */}
        <div className="relative z-10 grid grid-cols-8 md:grid-cols-12 gap-1 h-full">
          {Array.from({ length: 96 }, (_, index) => {
            const building = buildings.find(b => b.position === index);
            const row = Math.floor(index / 12);
            const col = index % 12;
            const isMainRoad = row === 3 || row === 4 || col === 5 || col === 6; // Ana yol alanları
            
            if (building) {
              const BuildingIcon = buildingTypes[building.type].icon;
              const isRoad = building.type === 'road' || building.type === 'mainStreet';
              
              if (isRoad) {
                return (
                  <div
                    key={index}
                    className={`bg-gradient-to-t ${buildingTypes[building.type].color} rounded flex items-center justify-center shadow-md`}
                    style={{ height: '30px' }}
                    title={buildingTypes[building.type].name}
                  >
                    <BuildingIcon size={12} className="text-white" />
                  </div>
                );
              }
              
              return (
                <div
                  key={index}
                  className={`bg-gradient-to-t ${buildingTypes[building.type].color} rounded-t-lg flex items-end justify-center p-1 shadow-lg transform hover:scale-105 transition-all cursor-pointer`}
                  style={{ height: `${Math.random() * 30 + 40}px` }}
                  title={buildingTypes[building.type].name}
                >
                  <BuildingIcon size={12} className="text-white" />
                </div>
              );
            }
            
            if (isMainRoad) {
              return (
                <div
                  key={index}
                  className="bg-gray-500/30 rounded border border-gray-400/50 flex items-center justify-center"
                  style={{ height: '30px' }}
                >
                  <Route size={10} className="text-gray-600/50" />
                </div>
              );
            }
            
            return (
              <div
                key={index}
                className="bg-green-400/20 rounded border border-dashed border-green-500/30 flex items-center justify-center text-green-600/50"
                style={{ height: '30px' }}
              >
                <div className="w-1 h-1 bg-green-500/30 rounded-full"></div>
              </div>
            );
          })}
        </div>

        {/* Şehir Adı */}
        <div className="absolute bottom-4 left-4 bg-black/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
          <h3 className="font-bold text-lg">Focus City</h3>
          <p className="text-sm opacity-80">Seviye {cityLevel} Şehri</p>
        </div>
        
        {/* Şehir İstatistikleri */}
        <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm">
          <div className="flex items-center gap-2 mb-1">
            <Building size={12} />
            <span>{buildings.length} Bina</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={12} />
            <span>{buildings.filter(b => b.type === 'road' || b.type === 'mainStreet').length} Yol</span>
          </div>
        </div>
      </div>

      {/* Bina İnşa Paneli */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Building className="text-blue-400" />
          Bina İnşa Et
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(buildingTypes).map(([type, building]) => {
            const Icon = building.icon;
            const canBuild = getAvailableFocusTime() >= building.cost && 
                           cityLevel >= (building.requiredLevel || 1);
            const isLocked = cityLevel < (building.requiredLevel || 1);
            
            return (
              <div
                key={type}
                className={`p-4 rounded-xl border transition-all ${
                  canBuild 
                    ? 'bg-gray-700/50 border-gray-600 hover:border-blue-500 cursor-pointer' 
                    : isLocked
                    ? 'bg-gray-800/30 border-gray-700 opacity-50'
                    : 'bg-gray-800/30 border-gray-700 opacity-75'
                }`}
                onClick={() => canBuild && buildBuilding(type)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${building.color}`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{building.name}</h4>
                    {isLocked && (
                      <span className="text-xs text-red-400">Seviye {building.requiredLevel} gerekli</span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm mb-3">{building.description}</p>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Maliyet:</span>
                    <span className="text-blue-400 font-semibold">{building.cost} dk</span>
                  </div>
                  {building.population > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nüfus:</span>
                      <span className="text-green-400">+{building.population}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mutluluk:</span>
                    <span className={building.happiness >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {building.happiness >= 0 ? '+' : ''}{building.happiness}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Şehir Başarıları */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Star className="text-yellow-400" />
          Şehir Başarıları
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border ${cityLevel >= 5 ? 'bg-green-500/20 border-green-500' : 'bg-gray-700/30 border-gray-600'}`}>
            <div className="text-2xl mb-2">🏘️</div>
            <h4 className="font-semibold text-white">Küçük Kasaba</h4>
            <p className="text-gray-300 text-sm">Seviye 5'e ulaş</p>
            <div className="text-xs text-gray-400 mt-1">{cityLevel >= 5 ? '✅ Tamamlandı' : `${cityLevel}/5`}</div>
          </div>
          
          <div className={`p-4 rounded-xl border ${cityLevel >= 10 ? 'bg-green-500/20 border-green-500' : 'bg-gray-700/30 border-gray-600'}`}>
            <div className="text-2xl mb-2">🏙️</div>
            <h4 className="font-semibold text-white">Büyük Şehir</h4>
            <p className="text-gray-300 text-sm">Seviye 10'a ulaş</p>
            <div className="text-xs text-gray-400 mt-1">{cityLevel >= 10 ? '✅ Tamamlandı' : `${cityLevel}/10`}</div>
          </div>
          
          <div className={`p-4 rounded-xl border ${population >= 100 ? 'bg-green-500/20 border-green-500' : 'bg-gray-700/30 border-gray-600'}`}>
            <div className="text-2xl mb-2">👥</div>
            <h4 className="font-semibold text-white">Nüfus Patlaması</h4>
            <p className="text-gray-300 text-sm">100 nüfusa ulaş</p>
            <div className="text-xs text-gray-400 mt-1">{population >= 100 ? '✅ Tamamlandı' : `${population}/100`}</div>
          </div>
          
          <div className={`p-4 rounded-xl border ${happiness >= 80 ? 'bg-green-500/20 border-green-500' : 'bg-gray-700/30 border-gray-600'}`}>
            <div className="text-2xl mb-2">😊</div>
            <h4 className="font-semibold text-white">Mutlu Şehir</h4>
            <p className="text-gray-300 text-sm">%80 mutluluk seviyesi</p>
            <div className="text-xs text-gray-400 mt-1">{happiness >= 80 ? '✅ Tamamlandı' : `${happiness}%/80%`}</div>
          </div>
          
          <div className={`p-4 rounded-xl border ${buildings.length >= 20 ? 'bg-green-500/20 border-green-500' : 'bg-gray-700/30 border-gray-600'}`}>
            <div className="text-2xl mb-2">🏗️</div>
            <h4 className="font-semibold text-white">İnşaat Ustası</h4>
            <p className="text-gray-300 text-sm">20 bina inşa et</p>
            <div className="text-xs text-gray-400 mt-1">{buildings.length >= 20 ? '✅ Tamamlandı' : `${buildings.length}/20`}</div>
          </div>
          
          <div className={`p-4 rounded-xl border ${focusEntries.reduce((sum, entry) => sum + entry.minutes, 0) >= 1000 ? 'bg-green-500/20 border-green-500' : 'bg-gray-700/30 border-gray-600'}`}>
            <div className="text-2xl mb-2">⏰</div>
            <h4 className="font-semibold text-white">Focus Ustası</h4>
            <p className="text-gray-300 text-sm">1000 dakika focus</p>
            <div className="text-xs text-gray-400 mt-1">
              {focusEntries.reduce((sum, entry) => sum + entry.minutes, 0) >= 1000 ? '✅ Tamamlandı' : 
               `${focusEntries.reduce((sum, entry) => sum + entry.minutes, 0)}/1000`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityBuilder;