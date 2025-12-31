
import React, { useRef, useState } from 'react';
import { Quote, Product } from '../types';
// Fixed missing import: Added 'Database' to lucide-react icons
import { Download, Upload, Trash2, ShieldAlert, CheckCircle, FileJson, Database } from 'lucide-react';

interface Props {
  quotes: Quote[];
  products: Product[];
  setQuotes: (quotes: Quote[]) => void;
  setProducts: (products: Product[]) => void;
}

const DatabaseView: React.FC<Props> = ({ quotes, products, setQuotes, setProducts }) => {
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const data = {
      quotes,
      products,
      exportDate: new Date().toISOString(),
      version: "1.0"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `نظام_الأسعار_احتياطي_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setStatus({ type: 'success', message: 'تم تصدير البيانات بنجاح!' });
    setTimeout(() => setStatus({ type: null, message: '' }), 3000);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.quotes && json.products) {
          setQuotes(json.quotes);
          setProducts(json.products);
          setStatus({ type: 'success', message: 'تم استيراد البيانات وتحديث النظام بنجاح!' });
        } else {
          throw new Error('تنسيق الملف غير صحيح');
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'فشل الاستيراد: الملف المختار غير صالح.' });
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
    setTimeout(() => setStatus({ type: null, message: '' }), 4000);
  };

  const clearAllData = () => {
    if (confirm('تحذير! سيتم مسح كافة البيانات المسجلة نهائياً. هل أنت متأكد؟')) {
      setQuotes([]);
      setStatus({ type: 'success', message: 'تم مسح كافة البيانات بنجاح.' });
      setTimeout(() => setStatus({ type: null, message: '' }), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Database className="text-emerald-600" />
          إدارة قاعدة البيانات والنسخ الاحتياطي
        </h2>
      </div>

      {status.type && (
        <div className={`p-4 rounded-lg flex items-center gap-3 animate-in fade-in zoom-in ${
          status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {status.type === 'success' ? <CheckCircle size={20} /> : <ShieldAlert size={20} />}
          <p className="font-semibold">{status.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-emerald-200 transition-colors group">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <Download size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">تصدير البيانات</h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            قم بتحميل نسخة احتياطية كاملة من جميع عروض الأسعار المسجلة وقائمة الأصناف الخاصة بك في ملف واحد. يمكنك الاحتفاظ بهذا الملف كأرشيف.
          </p>
          <button 
            onClick={exportData}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-95"
          >
            <FileJson size={20} />
            تحميل نسخة احتياطية (JSON)
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-200 transition-colors group">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <Upload size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">استيراد البيانات</h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            استرجع بياناتك من ملف نسخة احتياطية سابق. سيقوم هذا الإجراء باستبدال البيانات الحالية بالبيانات الموجودة في الملف المرفق.
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={importData} 
            accept=".json" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
          >
            <Upload size={20} />
            رفع واستعادة البيانات
          </button>
        </div>

        {/* Reset System */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 md:col-span-2">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-600">منطقة الخطر: تصفير النظام</h3>
                <p className="text-slate-500 text-sm">سيؤدي هذا الإجراء إلى حذف جميع عروض الأسعار المسجلة. لا يمكن التراجع عن هذه الخطوة.</p>
              </div>
            </div>
            <button 
              onClick={clearAllData}
              className="px-6 py-2 border-2 border-red-500 text-red-600 rounded-lg font-bold hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
            >
              <Trash2 size={18} />
              مسح قاعدة البيانات
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 mt-10">
        <h4 className="font-bold text-slate-700 mb-2">معلومات فنية:</h4>
        <ul className="text-sm text-slate-600 space-y-1 list-disc pr-5">
          <li>إجمالي عروض الأسعار المسجلة: <span className="font-bold text-emerald-600">{quotes.length}</span></li>
          <li>إجمالي الأصناف المعرفة: <span className="font-bold text-emerald-600">{products.length}</span></li>
          <li>نوع التخزين: LocalStorage (متصفح المستخدم)</li>
        </ul>
      </div>
    </div>
  );
};

export default DatabaseView;
