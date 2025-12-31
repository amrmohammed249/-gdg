
import React, { useState, useMemo, useEffect } from 'react';
import { Quote, Product, AggregatedItem } from './types';
import { DEFAULT_PRODUCTS } from './constants';
import QuotationForm from './components/QuotationForm';
import AggregationView from './components/AggregationView';
import SettingsView from './components/SettingsView';
import DatabaseView from './components/DatabaseView';
import InventoryView from './components/InventoryView';
import { LayoutGrid, ClipboardList, Settings, PlusCircle, Trash2, Printer, Eye, EyeOff, Database, Search, Box } from 'lucide-react';

const App: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    // Simplified initialization since DEFAULT_PRODUCTS now contains currentStock
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });
  const [activeTab, setActiveTab] = useState<'quotes' | 'aggregation' | 'settings' | 'database' | 'inventory'>('quotes');
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'full' | 'quantities'>('full');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const savedQuotes = localStorage.getItem('quotes');
    if (savedQuotes) setQuotes(JSON.parse(savedQuotes));
  }, []);

  useEffect(() => {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    localStorage.setItem('products', JSON.stringify(products));
  }, [quotes, products]);

  const addQuote = (quote: Quote) => {
    setQuotes([quote, ...quotes]);
    // خصم من المخزون عند إنشاء عرض سعر (اختياري - يمكن تعديله حسب الرغبة)
    const newProducts = [...products];
    quote.items.forEach(item => {
      const pIdx = newProducts.findIndex(p => p.id === item.productId);
      if (pIdx > -1) {
        newProducts[pIdx].currentStock -= (item.quantity * item.factor);
      }
    });
    setProducts(newProducts);
    setShowForm(false);
  };

  const deleteQuote = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العرض؟ سيتم إرجاع الكميات للمخزون.')) {
      const quote = quotes.find(q => q.id === id);
      if (quote) {
        const newProducts = [...products];
        quote.items.forEach(item => {
          const pIdx = newProducts.findIndex(p => p.id === item.productId);
          if (pIdx > -1) {
            newProducts[pIdx].currentStock += (item.quantity * item.factor);
          }
        });
        setProducts(newProducts);
      }
      setQuotes(quotes.filter(q => q.id !== id));
    }
  };

  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => 
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [quotes, searchQuery]);

  const aggregatedData = useMemo(() => {
    const totals: Record<string, { totalBase: number, totalPrice: number }> = {};
    quotes.forEach(quote => {
      quote.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return;
        const baseQty = item.quantity * item.factor;
        const linePrice = item.quantity * item.pricePerUnit;
        if (!totals[item.productId]) {
          totals[item.productId] = { totalBase: 0, totalPrice: 0 };
        }
        totals[item.productId].totalBase += baseQty;
        totals[item.productId].totalPrice += linePrice;
      });
    });
    return Object.entries(totals).map(([productId, data]) => {
      const product = products.find(p => p.id === productId)!;
      return {
        productId,
        productName: product.name,
        baseUnit: product.baseUnit,
        totalInBaseUnit: data.totalBase,
        totalPrice: data.totalPrice,
        category: product.category
      };
    });
  }, [quotes, products]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-l border-slate-200 shadow-sm no-print">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
            <LayoutGrid size={28} />
            <span>نظام الأسعار</span>
          </h1>
        </div>
        <nav className="mt-4 px-4 space-y-2">
          <button onClick={() => setActiveTab('quotes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'quotes' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}>
            <ClipboardList size={20} />
            <span>عروض الأسعار</span>
          </button>
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'inventory' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Box size={20} />
            <span>إدارة المخزون</span>
          </button>
          <button onClick={() => setActiveTab('aggregation')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'aggregation' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}>
            <LayoutGrid size={20} />
            <span>التجميع الكلي</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Settings size={20} />
            <span>كروت الأصناف</span>
          </button>
          <button onClick={() => setActiveTab('database')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'database' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Database size={20} />
            <span>قاعدة البيانات</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'quotes' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
                <h2 className="text-2xl font-bold text-slate-800">إدارة عروض الأسعار</h2>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute right-3 top-2.5 text-slate-400" size={18} />
                    <input type="text" placeholder="ابحث عن عميل..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <button onClick={() => setViewMode(viewMode === 'full' ? 'quantities' : 'full')} className="flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300">
                    {viewMode === 'full' ? <EyeOff size={18} /> : <Eye size={18} />}
                    {viewMode === 'full' ? 'كميات فقط' : 'أسعار'}
                  </button>
                  <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 shadow-md transition-all active:scale-95">
                    <PlusCircle size={20} />
                    إنشاء عرض جديد
                  </button>
                </div>
              </div>

              {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-emerald-100 no-print animate-in slide-in-from-top-4 duration-300">
                  <QuotationForm products={products} onSubmit={addQuote} onCancel={() => setShowForm(false)} />
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                {filteredQuotes.map(quote => (
                  <div key={quote.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group">
                    <div className="p-4 bg-slate-50 border-b flex justify-between items-center group-hover:bg-slate-100 transition-colors">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{quote.customerName}</h3>
                        <span className="text-sm text-slate-500">{new Date(quote.date).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => window.print()} className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg"><Printer size={20} /></button>
                        <button onClick={() => deleteQuote(quote.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 size={20} /></button>
                      </div>
                    </div>
                    <div className="p-6">
                      <table className="w-full text-right border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-600">
                            <th className="p-3 border">الصنف</th>
                            <th className="p-3 border">الكمية</th>
                            <th className="p-3 border">الوحدة</th>
                            {viewMode === 'full' && <th className="p-3 border">الإجمالي</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {quote.items.map(item => (
                            <tr key={item.id} className="border-b">
                              <td className="p-3 border font-medium">{products.find(p => p.id === item.productId)?.name}</td>
                              <td className="p-3 border font-semibold">{item.quantity}</td>
                              <td className="p-3 border text-slate-600">{item.unitName}</td>
                              {viewMode === 'full' && <td className="p-3 border font-bold text-emerald-700">{(item.quantity * item.pricePerUnit).toLocaleString()} ج.م</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <InventoryView products={products} setProducts={setProducts} />
          )}

          {activeTab === 'aggregation' && (
            <AggregationView data={aggregatedData} products={products} viewMode={viewMode} toggleViewMode={() => setViewMode(viewMode === 'full' ? 'quantities' : 'full')} />
          )}

          {activeTab === 'settings' && (
            <SettingsView products={products} setProducts={setProducts} />
          )}

          {activeTab === 'database' && (
            <DatabaseView quotes={quotes} products={products} setQuotes={setQuotes} setProducts={setProducts} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
