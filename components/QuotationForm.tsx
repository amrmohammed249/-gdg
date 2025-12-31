
import React, { useState } from 'react';
import { Product, Quote, QuoteItem } from '../types';
import { Plus, Trash2, X } from 'lucide-react';

interface Props {
  products: Product[];
  onSubmit: (quote: Quote) => void;
  onCancel: () => void;
}

const QuotationForm: React.FC<Props> = ({ products, onSubmit, onCancel }) => {
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState<Partial<QuoteItem>[]>([
    { id: Math.random().toString(), productId: '', quantity: 1, unitName: '', factor: 1, pricePerUnit: 0 }
  ]);

  const addItemRow = () => {
    setItems([...items, { id: Math.random().toString(), productId: '', quantity: 1, unitName: '', factor: 1, pricePerUnit: 0 }]);
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId,
      unitName: product.baseUnit, // افتراض الوحدة الأساسية أولاً
      factor: 1,
      pricePerUnit: product.salePrice
    };
    setItems(newItems);
  };

  const handleUnitChange = (index: number, unitName: string) => {
    const item = items[index];
    const product = products.find(p => p.id === item.productId);
    if (!product) return;

    let factor = 1;
    let price = product.salePrice;

    if (unitName !== product.baseUnit) {
      const subUnit = product.units.find(u => u.name === unitName);
      if (subUnit) {
        factor = subUnit.factor;
        price = product.salePrice * factor;
      }
    }

    const newItems = [...items];
    newItems[index] = { ...newItems[index], unitName, factor, pricePerUnit: price };
    setItems(newItems);
  };

  const updateItemField = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || items.some(i => !i.productId)) return;
    const newQuote: Quote = {
      id: Date.now().toString(),
      customerName,
      date: new Date().toISOString(),
      items: items as QuoteItem[]
    };
    onSubmit(newQuote);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="text-xl font-bold text-slate-800">إنشاء عرض سعر جديد</h3>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">اسم العميل</label>
          <input type="text" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="أدخل اسم العميل..." className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">التاريخ</label>
          <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2 border border-slate-300 rounded-lg outline-none" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold text-slate-700">الأصناف والكميات</label>
          <button type="button" onClick={addItemRow} className="text-emerald-600 flex items-center gap-1 text-sm font-semibold hover:underline">
            <Plus size={16} /> إضافة صنف
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="text-right text-xs text-slate-500 uppercase border-b">
                <th className="pb-2 pr-2">الصنف</th>
                <th className="pb-2 px-2">الوحدة</th>
                <th className="pb-2 px-2 w-24">الكمية</th>
                <th className="pb-2 px-2 w-32">سعر البيع</th>
                <th className="pb-2 px-2 w-32">الإجمالي</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const selectedProduct = products.find(p => p.id === item.productId);
                return (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-3 pr-2">
                      <select value={item.productId} onChange={(e) => handleProductChange(idx, e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500" required>
                        <option value="">اختر الصنف...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.category})</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-2">
                      <select value={item.unitName} onChange={(e) => handleUnitChange(idx, e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg disabled:bg-slate-50" disabled={!item.productId}>
                        {selectedProduct && (
                          <>
                            <option value={selectedProduct.baseUnit}>{selectedProduct.baseUnit}</option>
                            {selectedProduct.units.map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
                          </>
                        )}
                      </select>
                    </td>
                    <td className="py-3 px-2">
                      <input type="number" min="0.1" step="0.1" value={item.quantity} onChange={(e) => updateItemField(idx, 'quantity', parseFloat(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
                    </td>
                    <td className="py-3 px-2">
                      <input type="number" min="0" value={item.pricePerUnit} onChange={(e) => updateItemField(idx, 'pricePerUnit', parseFloat(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
                    </td>
                    <td className="py-3 px-2 text-emerald-700 font-bold">
                      {((item.quantity || 0) * (item.pricePerUnit || 0)).toLocaleString()}
                    </td>
                    <td className="py-3 text-center">
                      <button type="button" onClick={() => removeItem(idx)} className="text-slate-300 hover:text-red-500"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100">إلغاء</button>
        <button type="submit" className="px-8 py-2 rounded-lg bg-emerald-600 text-white font-bold shadow-md hover:bg-emerald-700">حفظ العرض</button>
      </div>
    </form>
  );
};

export default QuotationForm;
