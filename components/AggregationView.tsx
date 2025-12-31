
import React from 'react';
import { AggregatedItem, Product } from '../types';
import { Printer, Eye, EyeOff, Boxes, Layers } from 'lucide-react';

interface Props {
  data: AggregatedItem[];
  products: Product[];
  viewMode: 'full' | 'quantities';
  toggleViewMode: () => void;
}

const AggregationView: React.FC<Props> = ({ data, products, viewMode, toggleViewMode }) => {
  
  // وظيفة لتحليل الكمية الإجمالية إلى "وحدات فرعية + متبقي من الأساسي"
  const formatQuantity = (item: AggregatedItem) => {
    const product = products.find(p => p.id === item.productId);
    if (!product || product.units.length === 0) {
      return `${item.totalInBaseUnit} ${item.baseUnit}`;
    }

    // نأخذ أول وحدة فرعية للتوضيح (يمكن تطويرها لتأخذ الأكبر معامل)
    const subUnit = product.units[0]; 
    const fullUnits = Math.floor(item.totalInBaseUnit / subUnit.factor);
    const remainder = item.totalInBaseUnit % subUnit.factor;

    let parts = [];
    if (fullUnits > 0) parts.push(`${fullUnits} ${subUnit.name}`);
    if (remainder > 0) parts.push(`${remainder} ${item.baseUnit}`);
    
    return parts.length > 0 ? parts.join(' و ') : `0 ${item.baseUnit}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Boxes className="text-emerald-600" />
          التجميع الكلي للمبيعات
        </h2>
        <div className="flex gap-2">
          <button onClick={toggleViewMode} className="flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300">
            {viewMode === 'full' ? <EyeOff size={18} /> : <Eye size={18} />}
            {viewMode === 'full' ? 'كميات فقط' : 'إظهار الأسعار'}
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
            <Printer size={18} /> طباعة التقرير
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
        <div className="p-6">
          <div className="hidden print:block text-center mb-10 border-b pb-6">
            <h1 className="text-3xl font-bold mb-2">تقرير إجمالي المبيعات المجمعة</h1>
            <p className="text-slate-500">تم الاستخراج بتاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
          </div>

          {data.length === 0 ? (
            <div className="text-center py-20 text-slate-400">لا توجد بيانات متاحة للتجميع حالياً.</div>
          ) : (
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 print:bg-gray-100">
                  <th className="p-4 border">الصنف / التصنيف</th>
                  <th className="p-4 border">الوحدات الكلية</th>
                  <th className="p-4 border">الوزن الإجمالي</th>
                  {viewMode === 'full' && <th className="p-4 border">إجمالي القيمة</th>}
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-slate-50">
                    <td className="p-4 border">
                      <p className="font-bold text-slate-800">{item.productName}</p>
                      <span className="text-[10px] bg-slate-200 px-1 rounded text-slate-600 uppercase font-bold">{item.category}</span>
                    </td>
                    <td className="p-4 border">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold">
                        <Layers size={14} />
                        {formatQuantity(item)}
                      </div>
                    </td>
                    <td className="p-4 border font-mono text-slate-600">{item.totalInBaseUnit} {item.baseUnit}</td>
                    {viewMode === 'full' && (
                      <td className="p-4 border font-bold text-slate-900">
                        {item.totalPrice.toLocaleString()} ج.م
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              {viewMode === 'full' && (
                <tfoot>
                  <tr className="bg-emerald-50 print:bg-gray-100 font-bold">
                    <td colSpan={3} className="p-4 border text-left">الإجمالي العام لجميع الأصناف:</td>
                    <td className="p-4 border text-xl text-emerald-800">
                      {data.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()} ج.م
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl no-print flex gap-3">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg h-fit"><Boxes size={20}/></div>
        <p className="text-blue-800 text-sm">
          <strong>ملاحظة فنية:</strong> التجميع يقوم بتحويل كافة الطلبات (سواء كانت بالكيلو أو الشوال) إلى الوحدة الأساسية للصنف المخزنة في "كرت الصنف"، ثم يعرضها لك بشكل مفصل (مثال: 2 شوال و 10 كيلو).
        </p>
      </div>
    </div>
  );
};

export default AggregationView;
