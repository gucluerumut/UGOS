import React, { useState } from 'react';
import { Plus, X, DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3, Building, User, CreditCard, Wallet, Target, Calendar, ArrowUpRight, ArrowDownRight, Eye, EyeOff } from 'lucide-react';

const FinanceTracker = ({ finances, setFinances }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [financeType, setFinanceType] = useState('personal'); // personal or business
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense', // income, expense, investment
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    financeType: 'personal'
  });
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    financeType: 'personal'
  });
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [showDetails, setShowDetails] = useState(true);

  const personalCategories = {
    income: [
      { id: 'salary', name: 'Maaş', icon: Wallet, color: 'green' },
      { id: 'freelance', name: 'Freelance', icon: User, color: 'blue' },
      { id: 'investment', name: 'Yatırım Getirisi', icon: TrendingUp, color: 'purple' },
      { id: 'other_income', name: 'Diğer Gelir', icon: DollarSign, color: 'yellow' }
    ],
    expense: [
      { id: 'food', name: 'Yemek', icon: DollarSign, color: 'red' },
      { id: 'transport', name: 'Ulaşım', icon: DollarSign, color: 'blue' },
      { id: 'housing', name: 'Konut', icon: DollarSign, color: 'orange' },
      { id: 'entertainment', name: 'Eğlence', icon: DollarSign, color: 'purple' },
      { id: 'health', name: 'Sağlık', icon: DollarSign, color: 'green' },
      { id: 'education', name: 'Eğitim', icon: DollarSign, color: 'indigo' },
      { id: 'shopping', name: 'Alışveriş', icon: DollarSign, color: 'pink' },
      { id: 'utilities', name: 'Faturalar', icon: DollarSign, color: 'gray' },
      { id: 'other_expense', name: 'Diğer Gider', icon: DollarSign, color: 'red' }
    ]
  };

  const businessCategories = {
    income: [
      { id: 'revenue', name: 'Satış Geliri', icon: TrendingUp, color: 'green' },
      { id: 'service_income', name: 'Hizmet Geliri', icon: Building, color: 'blue' },
      { id: 'investment_income', name: 'Yatırım Geliri', icon: TrendingUp, color: 'purple' },
      { id: 'other_business_income', name: 'Diğer Gelir', icon: DollarSign, color: 'yellow' }
    ],
    expense: [
      { id: 'office_rent', name: 'Ofis Kirası', icon: Building, color: 'red' },
      { id: 'salaries', name: 'Maaşlar', icon: User, color: 'blue' },
      { id: 'marketing', name: 'Pazarlama', icon: TrendingUp, color: 'purple' },
      { id: 'equipment', name: 'Ekipman', icon: DollarSign, color: 'orange' },
      { id: 'software', name: 'Yazılım', icon: DollarSign, color: 'indigo' },
      { id: 'travel', name: 'Seyahat', icon: DollarSign, color: 'green' },
      { id: 'legal', name: 'Hukuki', icon: DollarSign, color: 'gray' },
      { id: 'insurance', name: 'Sigorta', icon: DollarSign, color: 'yellow' },
      { id: 'other_business_expense', name: 'Diğer Gider', icon: DollarSign, color: 'red' }
    ]
  };

  const periods = [
    { id: 'daily', name: 'Günlük' },
    { id: 'weekly', name: 'Haftalık' },
    { id: 'monthly', name: 'Aylık' },
    { id: 'yearly', name: 'Yıllık' }
  ];

  const addTransaction = () => {
    if (newTransaction.amount && newTransaction.category) {
      const transaction = {
        id: Date.now(),
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
        createdAt: new Date().toISOString()
      };
      setFinances(prev => ({
        ...prev,
        transactions: [...(prev.transactions || []), transaction]
      }));
      setNewTransaction({
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        financeType: financeType
      });
    }
  };

  const addBudget = () => {
    if (newBudget.category && newBudget.amount) {
      const budget = {
        id: Date.now(),
        ...newBudget,
        amount: parseFloat(newBudget.amount),
        createdAt: new Date().toISOString()
      };
      setFinances(prev => ({
        ...prev,
        budgets: [...(prev.budgets || []), budget]
      }));
      setNewBudget({
        category: '',
        amount: '',
        period: 'monthly',
        financeType: financeType
      });
    }
  };

  const deleteTransaction = (transactionId) => {
    setFinances(prev => ({
      ...prev,
      transactions: (prev.transactions || []).filter(t => t.id !== transactionId)
    }));
  };

  const deleteBudget = (budgetId) => {
    setFinances(prev => ({
      ...prev,
      budgets: (prev.budgets || []).filter(b => b.id !== budgetId)
    }));
  };

  const getTransactions = (type = null) => {
    const transactions = (finances?.transactions || []).filter(t => t.financeType === financeType);
    if (type) {
      return transactions.filter(t => t.type === type);
    }
    return transactions;
  };

  const getBudgets = () => {
    return (finances?.budgets || []).filter(b => b.financeType === financeType);
  };

  const getFinancialStats = () => {
    const transactions = getTransactions();
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const investments = transactions.filter(t => t.type === 'investment').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses - investments;

    // Kategori bazlı analiz
    const categoryStats = {};
    const categories = financeType === 'personal' ? personalCategories : businessCategories;
    
    ['income', 'expense'].forEach(type => {
      categoryStats[type] = {};
      categories[type].forEach(cat => {
        const categoryTransactions = transactions.filter(t => t.type === type && t.category === cat.id);
        categoryStats[type][cat.id] = {
          ...cat,
          amount: categoryTransactions.reduce((sum, t) => sum + t.amount, 0),
          count: categoryTransactions.length
        };
      });
    });

    // Bütçe analizi
    const budgets = getBudgets();
    const budgetAnalysis = budgets.map(budget => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        ...budget,
        spent,
        remaining: budget.amount - spent,
        percentage: budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0
      };
    });

    return {
      income,
      expenses,
      investments,
      balance,
      categoryStats,
      budgetAnalysis,
      totalTransactions: transactions.length
    };
  };

  const getCurrentCategories = () => {
    return financeType === 'personal' ? personalCategories : businessCategories;
  };

  const getCategoryName = (categoryId, type) => {
    const categories = getCurrentCategories();
    const category = categories[type]?.find(c => c.id === categoryId);
    return category?.name || categoryId;
  };

  const getCategoryColor = (categoryId, type) => {
    const categories = getCurrentCategories();
    const category = categories[type]?.find(c => c.id === categoryId);
    return category?.color || 'gray';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const stats = getFinancialStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Finans Yönetimi</h2>
          <p className="text-gray-400">Gelir, gider ve bütçenizi takip edin</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            {showDetails ? <Eye size={16} /> : <EyeOff size={16} />}
            {showDetails ? 'Detayları Gizle' : 'Detayları Göster'}
          </button>
        </div>
      </div>

      {/* Finance Type Toggle */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setFinanceType('personal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            financeType === 'personal'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
          }`}
        >
          <User size={18} />
          Bireysel
        </button>
        <button
          onClick={() => setFinanceType('business')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            financeType === 'business'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
          }`}
        >
          <Building size={18} />
          Şirket
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'overview', name: 'Genel Bakış', icon: BarChart3 },
          { id: 'transactions', name: 'İşlemler', icon: DollarSign },
          { id: 'budgets', name: 'Bütçeler', icon: Target },
          { id: 'add', name: 'Ekle', icon: Plus }
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
          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Toplam Gelir</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.income)}</p>
                </div>
                <ArrowUpRight className="text-green-200" size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100">Toplam Gider</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.expenses)}</p>
                </div>
                <ArrowDownRight className="text-red-200" size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Yatırımlar</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.investments)}</p>
                </div>
                <TrendingUp className="text-purple-200" size={32} />
              </div>
            </div>

            <div className={`bg-gradient-to-r ${stats.balance >= 0 ? 'from-blue-600 to-blue-700' : 'from-orange-600 to-orange-700'} p-6 rounded-lg text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${stats.balance >= 0 ? 'text-blue-100' : 'text-orange-100'}`}>Net Bakiye</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.balance)}</p>
                </div>
                <Wallet className={`${stats.balance >= 0 ? 'text-blue-200' : 'text-orange-200'}`} size={32} />
              </div>
            </div>
          </div>

          {/* Category Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income Categories */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-100 mb-4">Gelir Kategorileri</h3>
              <div className="space-y-3">
                {Object.values(stats.categoryStats.income || {}).map(category => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full bg-${category.color}-500`}></div>
                      <span className="text-gray-300">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-medium">{formatCurrency(category.amount)}</div>
                      <div className="text-xs text-gray-400">{category.count} işlem</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Categories */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-100 mb-4">Gider Kategorileri</h3>
              <div className="space-y-3">
                {Object.values(stats.categoryStats.expense || {}).map(category => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full bg-${category.color}-500`}></div>
                      <span className="text-gray-300">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-red-400 font-medium">{formatCurrency(category.amount)}</div>
                      <div className="text-xs text-gray-400">{category.count} işlem</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Budget Overview */}
          {stats.budgetAnalysis.length > 0 && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-100 mb-4">Bütçe Durumu</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.budgetAnalysis.map(budget => (
                  <div key={budget.id} className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-100">
                        {getCategoryName(budget.category, 'expense')}
                      </h4>
                      <span className={`text-sm ${budget.percentage > 100 ? 'text-red-400' : budget.percentage > 80 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {budget.percentage}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Harcanan:</span>
                        <span className="text-gray-200">{formatCurrency(budget.spent)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Bütçe:</span>
                        <span className="text-gray-200">{formatCurrency(budget.amount)}</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            budget.percentage > 100 ? 'bg-red-500' : 
                            budget.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400 text-center">
                        Kalan: {formatCurrency(budget.remaining)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-100">İşlemler</h3>
            <div className="text-sm text-gray-400">
              Toplam {stats.totalTransactions} işlem
            </div>
          </div>

          <div className="space-y-4">
            {getTransactions().slice().reverse().map(transaction => {
              const color = getCategoryColor(transaction.category, transaction.type);
              const categoryName = getCategoryName(transaction.category, transaction.type);
              
              return (
                <div key={transaction.id} className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full bg-${color}-500`}></div>
                      <div>
                        <h4 className="text-gray-100 font-medium">{categoryName}</h4>
                        {transaction.description && (
                          <p className="text-gray-400 text-sm">{transaction.description}</p>
                        )}
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.date).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`font-semibold ${
                          transaction.type === 'income' ? 'text-green-400' : 
                          transaction.type === 'expense' ? 'text-red-400' : 'text-purple-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                        <div className="text-xs text-gray-400 capitalize">
                          {transaction.type === 'income' ? 'Gelir' : 
                           transaction.type === 'expense' ? 'Gider' : 'Yatırım'}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {getTransactions().length === 0 && (
              <div className="text-center py-12">
                <DollarSign size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Henüz işlem eklenmemiş</p>
                <p className="text-gray-500">İlk işleminizi eklemek için "Ekle" sekmesini kullanın</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Budgets Tab */}
      {activeTab === 'budgets' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-100">Bütçeler</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.budgetAnalysis.map(budget => (
              <div key={budget.id} className="bg-gray-800 p-6 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-100">
                      {getCategoryName(budget.category, 'expense')}
                    </h4>
                    <p className="text-sm text-gray-400 capitalize">{budget.period}</p>
                  </div>
                  <button
                    onClick={() => deleteBudget(budget.id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Harcanan:</span>
                    <span className="text-red-400 font-medium">{formatCurrency(budget.spent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bütçe:</span>
                    <span className="text-gray-200 font-medium">{formatCurrency(budget.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Kalan:</span>
                    <span className={`font-medium ${budget.remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(budget.remaining)}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        budget.percentage > 100 ? 'bg-red-500' : 
                        budget.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-center">
                    <span className={`text-lg font-bold ${
                      budget.percentage > 100 ? 'text-red-400' : 
                      budget.percentage > 80 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {budget.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {getBudgets().length === 0 && (
            <div className="text-center py-12">
              <Target size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Henüz bütçe eklenmemiş</p>
              <p className="text-gray-500">İlk bütçenizi eklemek için "Ekle" sekmesini kullanın</p>
            </div>
          )}
        </div>
      )}

      {/* Add Tab */}
      {activeTab === 'add' && (
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Add Transaction */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-100 mb-6">Yeni İşlem Ekle</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">İşlem Türü</label>
                  <select
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, type: e.target.value, category: '' }))}
                    className="w-full bg-gray-700 text-gray-100 px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="income">Gelir</option>
                    <option value="expense">Gider</option>
                    <option value="investment">Yatırım</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Kategori</label>
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-gray-700 text-gray-100 px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Kategori seçin</option>
                    {getCurrentCategories()[newTransaction.type]?.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Tutar</label>
                  <input
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full bg-gray-700 text-gray-100 px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Tarih</label>
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-gray-700 text-gray-100 px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Açıklama</label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-gray-700 text-gray-100 px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="İşlem açıklaması (opsiyonel)"
                />
              </div>

              <button
                onClick={addTransaction}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                İşlem Ekle
              </button>
            </div>
          </div>

          {/* Add Budget */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-100 mb-6">Yeni Bütçe Ekle</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Kategori</label>
                  <select
                    value={newBudget.category}
                    onChange={(e) => setNewBudget(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-gray-700 text-gray-100 px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Kategori seçin</option>
                    {getCurrentCategories().expense?.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Dönem</label>
                  <select
                    value={newBudget.period}
                    onChange={(e) => setNewBudget(prev => ({ ...prev, period: e.target.value }))}
                    className="w-full bg-gray-700 text-gray-100 px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    {periods.map(period => (
                      <option key={period.id} value={period.id}>{period.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Bütçe Tutarı</label>
                <input
                  type="number"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full bg-gray-700 text-gray-100 px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="0.00"
                />
              </div>

              <button
                onClick={addBudget}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Bütçe Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceTracker;