import React, { useState, useRef } from 'react';
import { User, Camera, Upload, Settings, Palette, Save, X } from 'lucide-react';

const PersonalAvatar = () => {
  const [avatar, setAvatar] = useState(localStorage.getItem('userAvatar') || '');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'Kullanıcı');
  const [userTitle, setUserTitle] = useState(localStorage.getItem('userTitle') || 'Kişisel Gelişim Yolcusu');
  const [themeColor, setThemeColor] = useState(localStorage.getItem('themeColor') || '#3B82F6');
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [tempTitle, setTempTitle] = useState(userTitle);
  const [tempColor, setTempColor] = useState(themeColor);
  const fileInputRef = useRef(null);

  const predefinedAvatars = [
    '👤', '👨‍💼', '👩‍💼', '🧑‍💻', '👨‍🎓', '👩‍🎓', '🧑‍🎨', '👨‍🔬', '👩‍🔬',
    '🧑‍🚀', '👨‍⚕️', '👩‍⚕️', '🧑‍🏫', '👨‍🌾', '👩‍🌾', '🧑‍🍳', '👨‍🎤', '👩‍🎤'
  ];

  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target.result);
        localStorage.setItem('userAvatar', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPredefinedAvatar = (emoji) => {
    setAvatar(emoji);
    localStorage.setItem('userAvatar', emoji);
  };

  const saveSettings = () => {
    setUserName(tempName);
    setUserTitle(tempTitle);
    setThemeColor(tempColor);
    localStorage.setItem('userName', tempName);
    localStorage.setItem('userTitle', tempTitle);
    localStorage.setItem('themeColor', tempColor);
    setIsEditing(false);
    
    // Tema rengini CSS değişkenine uygula
    document.documentElement.style.setProperty('--primary-color', tempColor);
  };

  const cancelEdit = () => {
    setTempName(userName);
    setTempTitle(userTitle);
    setTempColor(themeColor);
    setIsEditing(false);
  };

  const getAvatarDisplay = () => {
    if (avatar) {
      if (avatar.startsWith('data:') || avatar.startsWith('http')) {
        return (
          <img 
            src={avatar} 
            alt="Avatar" 
            className="w-full h-full object-cover rounded-full"
          />
        );
      } else {
        return (
          <span className="text-4xl">{avatar}</span>
        );
      }
    }
    return <User className="w-12 h-12 text-gray-400" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <User className="w-6 h-6" style={{ color: themeColor }} />
          Kişisel Profil
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          style={{ color: themeColor }}
        >
          {isEditing ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
        </button>
      </div>

      {/* Profil Kartı */}
      <div className="text-center mb-6">
        <div className="relative inline-block mb-4">
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center border-4 mx-auto"
            style={{ borderColor: themeColor }}
          >
            {getAvatarDisplay()}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 p-2 rounded-full bg-white shadow-lg border-2 hover:bg-gray-50 transition-colors"
            style={{ borderColor: themeColor, color: themeColor }}
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': themeColor }}
              placeholder="İsminizi girin"
            />
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': themeColor }}
              placeholder="Unvanınızı girin"
            />
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{userName}</h3>
            <p className="text-gray-600">{userTitle}</p>
          </div>
        )}
      </div>

      {/* Hazır Avatar Seçenekleri */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Hazır Avatarlar
        </h4>
        <div className="grid grid-cols-6 gap-2">
          {predefinedAvatars.map((emoji, index) => (
            <button
              key={index}
              onClick={() => selectPredefinedAvatar(emoji)}
              className={`p-2 rounded-lg text-2xl hover:bg-gray-100 transition-colors border-2 ${
                avatar === emoji ? 'border-current' : 'border-transparent'
              }`}
              style={{ color: avatar === emoji ? themeColor : 'inherit' }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Tema Rengi Seçimi */}
      {isEditing && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Tema Rengi
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {colorOptions.map((color, index) => (
              <button
                key={index}
                onClick={() => setTempColor(color)}
                className={`w-10 h-10 rounded-lg border-4 transition-all ${
                  tempColor === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Kaydet/İptal Butonları */}
      {isEditing && (
        <div className="flex gap-3">
          <button
            onClick={saveSettings}
            className="flex-1 py-2 px-4 rounded-lg text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            style={{ backgroundColor: tempColor }}
          >
            <Save className="w-4 h-4" />
            Kaydet
          </button>
          <button
            onClick={cancelEdit}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            İptal
          </button>
        </div>
      )}

      {/* İstatistikler */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold" style={{ color: themeColor }}>
              {JSON.parse(localStorage.getItem('tasks') || '[]').length}
            </div>
            <div className="text-sm text-gray-600">Toplam Görev</div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: themeColor }}>
              {JSON.parse(localStorage.getItem('goals') || '[]').length}
            </div>
            <div className="text-sm text-gray-600">Aktif Hedef</div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: themeColor }}>
              {JSON.parse(localStorage.getItem('habits') || '[]').length}
            </div>
            <div className="text-sm text-gray-600">Takip Edilen Alışkanlık</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalAvatar;