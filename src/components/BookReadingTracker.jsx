import React, { useState, useEffect } from 'react';
import { Book, Plus, Clock, Calendar, TrendingUp, Award, Star, BookOpen, Target, Edit, Trash2, Search, Filter } from 'lucide-react';

const BookReadingTracker = ({ bookData, setBookData }) => {
  const [activeTab, setActiveTab] = useState('library');
  const [showAddBook, setShowAddBook] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingBook, setEditingBook] = useState(null);
  
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    totalPages: '',
    currentPage: 0,
    genre: '',
    rating: 0,
    status: 'reading',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    favorite: false
  });

  const genres = [
    'Roman', 'Bilim Kurgu', 'Fantastik', 'Polisiye', 'Tarih', 'Biyografi',
    'Kişisel Gelişim', 'İş & Ekonomi', 'Bilim', 'Felsefe', 'Sanat', 'Diğer'
  ];

  const statuses = [
    { id: 'reading', name: 'Okuyor', color: 'blue' },
    { id: 'completed', name: 'Tamamlandı', color: 'green' },
    { id: 'paused', name: 'Duraklatıldı', color: 'yellow' },
    { id: 'wishlist', name: 'İstek Listesi', color: 'purple' }
  ];

  const addBook = () => {
    if (!newBook.title || !newBook.author) return;

    const book = {
      id: Date.now(),
      ...newBook,
      totalPages: parseInt(newBook.totalPages) || 0,
      currentPage: parseInt(newBook.currentPage) || 0,
      addedDate: new Date().toISOString(),
      readingSessions: []
    };

    setBookData(prev => [...(prev || []), book]);
    setNewBook({
      title: '',
      author: '',
      totalPages: '',
      currentPage: 0,
      genre: '',
      rating: 0,
      status: 'reading',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
      favorite: false
    });
    setShowAddBook(false);
  };

  const updateBook = (bookId, updates) => {
    setBookData(prev => prev.map(book => 
      book.id === bookId ? { ...book, ...updates } : book
    ));
  };

  const deleteBook = (bookId) => {
    setBookData(prev => prev.filter(book => book.id !== bookId));
  };

  const addReadingSession = (bookId, pages) => {
    const session = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      pages: parseInt(pages),
      timestamp: new Date().toISOString()
    };

    setBookData(prev => prev.map(book => {
      if (book.id === bookId) {
        const newCurrentPage = Math.min(book.currentPage + parseInt(pages), book.totalPages);
        const newStatus = newCurrentPage >= book.totalPages ? 'completed' : book.status;
        const endDate = newStatus === 'completed' && !book.endDate ? 
          new Date().toISOString().split('T')[0] : book.endDate;

        return {
          ...book,
          currentPage: newCurrentPage,
          status: newStatus,
          endDate,
          readingSessions: [...(book.readingSessions || []), session]
        };
      }
      return book;
    }));
  };

  const getFilteredBooks = () => {
    let filtered = bookData || [];
    
    if (searchTerm) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(book => book.status === filterStatus);
    }
    
    return filtered;
  };

  const getTotalBooks = () => (bookData || []).length;
  const getCompletedBooks = () => (bookData || []).filter(book => book.status === 'completed').length;
  const getCurrentlyReading = () => (bookData || []).filter(book => book.status === 'reading').length;
  const getTotalPages = () => (bookData || []).reduce((sum, book) => sum + (book.currentPage || 0), 0);

  const getReadingStreak = () => {
    const sessions = (bookData || []).flatMap(book => book.readingSessions || []);
    if (sessions.length === 0) return 0;

    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasSession = sessions.some(session => session.date === dateStr);
      
      if (hasSession) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const getMonthlyStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyBooks = (bookData || []).filter(book => {
      if (book.status !== 'completed' || !book.endDate) return false;
      const endDate = new Date(book.endDate);
      return endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear;
    });
    
    const monthlyPages = monthlyBooks.reduce((sum, book) => sum + (book.totalPages || 0), 0);
    
    return { books: monthlyBooks.length, pages: monthlyPages };
  };

  const getAverageRating = () => {
    const ratedBooks = (bookData || []).filter(book => book.rating > 0);
    if (ratedBooks.length === 0) return 0;
    const total = ratedBooks.reduce((sum, book) => sum + book.rating, 0);
    return Math.round((total / ratedBooks.length) * 10) / 10;
  };

  const getProgress = (book) => {
    if (!book.totalPages || book.totalPages === 0) return 0;
    return Math.round((book.currentPage / book.totalPages) * 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const monthlyStats = getMonthlyStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
          Book Reading Tracker
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowStats(!showStats)}
            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-xl transition-all"
          >
            <TrendingUp size={20} />
          </button>
          <button 
            onClick={() => setShowAddBook(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white p-3 rounded-xl transition-all"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* İstatistikler */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl text-white">
            <div className="flex items-center gap-3 mb-2">
              <Book size={24} />
              <span className="text-lg font-semibold">Toplam Kitap</span>
            </div>
            <div className="text-3xl font-bold">{getTotalBooks()}</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-2xl text-white">
            <div className="flex items-center gap-3 mb-2">
              <Award size={24} />
              <span className="text-lg font-semibold">Tamamlanan</span>
            </div>
            <div className="text-3xl font-bold">{getCompletedBooks()}</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-2xl text-white">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen size={24} />
              <span className="text-lg font-semibold">Okunan Sayfa</span>
            </div>
            <div className="text-3xl font-bold">{getTotalPages()}</div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-600 to-amber-800 p-6 rounded-2xl text-white">
            <div className="flex items-center gap-3 mb-2">
              <Star size={24} />
              <span className="text-lg font-semibold">Ortalama Puan</span>
            </div>
            <div className="text-3xl font-bold">{getAverageRating()}/5</div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-xl">
        {[
          { id: 'library', name: 'Kütüphane', icon: Book },
          { id: 'stats', name: 'İstatistikler', icon: TrendingUp },
          { id: 'reading', name: 'Okuma Seansı', icon: BookOpen }
        ].map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
              }`}
            >
              <IconComponent size={20} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {activeTab === 'library' && (
        <div className="space-y-6">
          {/* Arama ve Filtreler */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Kitap veya yazar ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            >
              <option value="all">Tüm Durumlar</option>
              {statuses.map(status => (
                <option key={status.id} value={status.id}>{status.name}</option>
              ))}
            </select>
          </div>

          {/* Kitap Listesi */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredBooks().map(book => {
              const status = statuses.find(s => s.id === book.status);
              const progress = getProgress(book);
              
              return (
                <div key={book.id} className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-100 mb-1">{book.title}</h3>
                      <p className="text-gray-400 text-sm">{book.author}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {book.favorite && <Star size={16} className="text-yellow-400 fill-current" />}
                      <button
                        onClick={() => setEditingBook(book)}
                        className="text-gray-400 hover:text-gray-200 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteBook(book.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs bg-${status.color}-500/20 text-${status.color}-400`}>
                        {status.name}
                      </span>
                      {book.genre && (
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-600 text-gray-300">
                          {book.genre}
                        </span>
                      )}
                    </div>

                    {book.totalPages > 0 && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">İlerleme</span>
                          <span className="text-gray-300">{book.currentPage} / {book.totalPages} sayfa</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`bg-${status.color}-500 h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="text-right text-sm text-gray-400 mt-1">{progress}%</div>
                      </div>
                    )}

                    {book.rating > 0 && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < book.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}
                          />
                        ))}
                      </div>
                    )}

                    {book.status === 'reading' && book.totalPages > 0 && (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Sayfa sayısı"
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.target.value) {
                              addReadingSession(book.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const input = e.target.parentElement.querySelector('input');
                            if (input.value) {
                              addReadingSession(book.id, input.value);
                              input.value = '';
                            }
                          }}
                          className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded text-sm transition-all"
                        >
                          Ekle
                        </button>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      {book.startDate && `Başlangıç: ${formatDate(book.startDate)}`}
                      {book.endDate && ` • Bitiş: ${formatDate(book.endDate)}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {getFilteredBooks().length === 0 && (
            <div className="text-center py-12">
              <Book size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                {searchTerm || filterStatus !== 'all' ? 'Arama kriterlerine uygun kitap bulunamadı' : 'Henüz kitap eklenmemiş'}
              </p>
              <p className="text-gray-500">İlk kitabınızı eklemek için + butonunu kullanın</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Bu Ay İstatistikleri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-2xl text-white">
              <h3 className="text-xl font-semibold mb-2">Bu Ay</h3>
              <div className="text-3xl font-bold">{monthlyStats.books} kitap</div>
              <div className="text-lg opacity-90">{monthlyStats.pages} sayfa</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-2xl text-white">
              <h3 className="text-xl font-semibold mb-2">Okuma Serisi</h3>
              <div className="text-3xl font-bold">{getReadingStreak()} gün</div>
              <div className="text-lg opacity-90">Ardışık okuma</div>
            </div>
          </div>

          {/* Tür Dağılımı */}
          <div className="bg-gray-800 p-6 rounded-2xl">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Tür Dağılımı</h3>
            <div className="space-y-3">
              {genres.map(genre => {
                const genreBooks = (bookData || []).filter(book => book.genre === genre);
                const percentage = getTotalBooks() > 0 ? (genreBooks.length / getTotalBooks()) * 100 : 0;
                
                if (genreBooks.length === 0) return null;
                
                return (
                  <div key={genre} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-gray-400">{genre}</div>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-sm text-gray-300 text-right">{genreBooks.length}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reading' && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-100 mb-2">Şu Anda Okuduğunuz Kitaplar</h3>
            <p className="text-gray-400">Okuma ilerlemelerinizi buradan takip edebilirsiniz</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(bookData || []).filter(book => book.status === 'reading').map(book => {
              const progress = getProgress(book);
              
              return (
                <div key={book.id} className="bg-gradient-to-br from-amber-600 to-orange-800 p-6 rounded-2xl text-white">
                  <h4 className="text-xl font-semibold mb-1">{book.title}</h4>
                  <p className="text-amber-100 mb-4">{book.author}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>İlerleme</span>
                        <span>{book.currentPage} / {book.totalPages} sayfa</span>
                      </div>
                      <div className="w-full bg-amber-800 rounded-full h-3">
                        <div 
                          className="bg-white h-3 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="text-right text-sm mt-1">{progress}%</div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Okunan sayfa"
                        className="flex-1 bg-amber-700 border border-amber-600 rounded px-3 py-2 text-white placeholder-amber-200"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value) {
                            addReadingSession(book.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = e.target.parentElement.querySelector('input');
                          if (input.value) {
                            addReadingSession(book.id, input.value);
                            input.value = '';
                          }
                        }}
                        className="bg-white text-amber-600 px-4 py-2 rounded font-semibold hover:bg-amber-50 transition-all"
                      >
                        Ekle
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {getCurrentlyReading() === 0 && (
            <div className="text-center py-12">
              <BookOpen size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Şu anda okuduğunuz kitap yok</p>
              <p className="text-gray-500">Kütüphane sekmesinden yeni kitap ekleyebilirsiniz</p>
            </div>
          )}
        </div>
      )}

      {/* Kitap Ekleme Modal */}
      {showAddBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Yeni Kitap Ekle</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Kitap Adı *</label>
                <input
                  type="text"
                  value={newBook.title}
                  onChange={(e) => setNewBook(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  placeholder="Kitap adını girin"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Yazar *</label>
                <input
                  type="text"
                  value={newBook.author}
                  onChange={(e) => setNewBook(prev => ({ ...prev, author: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  placeholder="Yazar adını girin"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Toplam Sayfa</label>
                  <input
                    type="number"
                    value={newBook.totalPages}
                    onChange={(e) => setNewBook(prev => ({ ...prev, totalPages: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Mevcut Sayfa</label>
                  <input
                    type="number"
                    value={newBook.currentPage}
                    onChange={(e) => setNewBook(prev => ({ ...prev, currentPage: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Tür</label>
                <select
                  value={newBook.genre}
                  onChange={(e) => setNewBook(prev => ({ ...prev, genre: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Tür seçin</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Durum</label>
                <select
                  value={newBook.status}
                  onChange={(e) => setNewBook(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                >
                  {statuses.map(status => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Notlar</label>
                <textarea
                  value={newBook.notes}
                  onChange={(e) => setNewBook(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white h-20 resize-none"
                  placeholder="Kitap hakkında notlarınız..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddBook(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-all"
              >
                İptal
              </button>
              <button
                onClick={addBook}
                disabled={!newBook.title || !newBook.author}
                className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-all"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookReadingTracker;