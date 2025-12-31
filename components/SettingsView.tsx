
import React, { useState } from 'react';
import { Product, SubUnit } from '../types';
import { Plus, Trash2, Save, Tags, Package, DollarSign, Box } from 'lucide-react';

interface Props {
  products: Product[];
  setProducts: (products: Product[]) => void;
}

const SettingsView: React.FC<Props> = ({ products, setProducts }) => {
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    baseUnit: 'كيلو',
    purchasePrice: 0,
    salePrice: 0,
    category: 'عام',
    units: [],
    currentStock: 0
  });

  const [tempUnit, setTempUnit] = useState<SubUnit>({ name: '', factor: 1 });

  const addProduct = () => {
    if (!newProduct.name || !newProduct.baseUnit) return;
    const product: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProduct.name!,
      baseUnit: newProduct.baseUnit!,
      purchasePrice: newProduct.purchasePrice || 0,
      salePrice: newProduct.salePrice || 0,
      category: newProduct.category || 'عام',
      units: newProduct.units || [],
      currentStock: newProduct.currentStock || 0
    };
    setProducts([...products, product]);
    setNewProduct({ name: '', baseUnit: 'كيلو', purchasePrice: 0, salePrice: 0, category: 'عام', units: [], currentStock: 0 });
  };

  const addSubUnitToNew = () => {
    if (!tempUnit.name || tempUnit.factor <= 0) return;
    setNewProduct({
      ...newProduct,
      units: [...(newProduct.units || []), { ...tempUnit }]
    });
    setTempUnit({ name: '', factor: 1 });
  };

  const deleteProduct = (id: string) => {
    if (confirm('هل تريد حذف هذا الصنف نهائياً من النظام؟')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <h2 className="text-2xl font-bold text-slate-800">إدارة كروت الأصناف والبيانات الأساسية</h2>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold mb-6 text-emerald-700 flex items-center gap-2">
          <Package size={20} /> إنشاء كرت صنف متكامل
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">اسم الصنف الكامل</label>
            <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="مثال: عدس أحمر تركي نمرة 1" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">التصنيف الرئيسي</label>
            <input type="text" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="مثال: بقوليات" />
          </div>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h4 className="font-bold text-sm mb-3 flex items-center gap-1 text-blue-600"><Tags size={14} /> الوحدة والأسعار</h4>
            <div className="space-y-3">
              <input type="text" value={newProduct.baseUnit} onChange={(e) => setNewProduct({ ...newProduct, baseUnit: e.target.value })} className="w-full p-2 border rounded-lg bg-white" placeholder="الوحدة (كيلو/قطعة)" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500">سعر الشراء</label>
                  <input type="number" value={newProduct.purchasePrice} onChange={(e) => setNewProduct({ ...newProduct, purchasePrice: parseFloat(e.target.value) })} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500">سعر البيع</label>
                  <input type="number" value={newProduct.salePrice} onChange={(e) => setNewProduct({ ...newProduct, salePrice: parseFloat(e.target.value) })} className="w-full p-2 border rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
            <h4 className="font-bold text-sm mb-3 flex items-center gap-1 text-amber-700"><Box size={14} /> الرصيد الافتتاحي</h4>
            <div className="space-y-3">
              <label className="text-xs text-slate-600">الكمية الموجودة حالياً بالمخزن:</label>
              <div className="flex items-center gap-2">
                <input type="number" value={newProduct.currentStock} onChange={(e) => setNewProduct({ ...newProduct, currentStock: parseFloat(e.target.value) })} className="w-full p-2 border rounded-lg bg-white" />
                <span className="text-sm font-bold">{newProduct.baseUnit}</span>
              </div>
              <p className="text-[10px] text-slate-400 italic">ملاحظة: يمكنك لاحقاً استخدام الذكاء الاصطناعي لإضافة كميات أخرى.</p>
            </div>
          </div>

          <div className="md:col-span-1 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <h4 className="font-bold text-sm mb-3 flex items-center gap-1 text-emerald-800"><Package size={14} /> وحدات التعبئة الفرعية</h4>
            <div className="flex gap-2 mb-4">
              <input type="text" value={tempUnit.name} onChange={(e) => setTempUnit({ ...tempUnit, name: e.target.value })} className="flex-1 p-2 border rounded-lg bg-white text-xs" placeholder="شوال/كرتونة" />
              <input type="number" value={tempUnit.factor} onChange={(e) => setTempUnit({ ...tempUnit, factor: parseFloat(e.target.value) })} className="w-16 p-2 border rounded-lg bg-white text-xs" placeholder="كم كيلو؟" />
              <button onClick={addSubUnitToNew} className="bg-emerald-600 text-white p-2 rounded-lg"><Plus size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-1">
              {newProduct.units?.map((u, i) => (
                <div key={i} className="bg-white border border-emerald-200 px-2 py-1 rounded-full text-[10px] flex items-center gap-1">
                  <b>{u.name}</b> ({u.factor})
                  <button onClick={() => setNewProduct({...newProduct, units: newProduct.units?.filter((_, idx) => idx !== i)})}><Trash2 size={10} className="text-red-400"/></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex justify-end">
          <button onClick={addProduct} className="bg-emerald-600 text-white px-12 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2">
            <Save size={20} /> حفظ واعتماد كرت الصنف
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group">
            <div className="p-5 bg-slate-50 border-b flex justify-between items-start group-hover:bg-slate-100 transition-colors">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded mb-1 inline-block uppercase">{product.category}</span>
                <h4 className="text-lg font-bold text-slate-800">{product.name}</h4>
              </div>
              <button onClick={() => deleteProduct(product.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
            </div>
            <div className="p-5 flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-xs text-slate-400">الرصيد في المستودع</p>
                <p className={`text-xl font-black ${product.currentStock < 10 ? 'text-red-600' : 'text-emerald-700'}`}>
                  {product.currentStock} {product.baseUnit}
                </p>
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400">سعر البيع</p>
                <p className="text-lg font-bold text-slate-700">{product.salePrice} ج.م</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsView;
