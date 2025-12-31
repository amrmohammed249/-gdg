
import React, { useState, useRef } from 'react';
import { Product, AIAnalyzedRow } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
import { Box, Plus, Minus, Search, Sparkles, Image as ImageIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  products: Product[];
  setProducts: (products: Product[]) => void;
}

const InventoryView: React.FC<Props> = ({ products, setProducts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AIAnalyzedRow[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateStockManually = (id: string, amount: number) => {
    setProducts(products.map(p => p.id === id ? { ...p, currentStock: Math.max(0, p.currentStock + amount) } : p));
  };

  const handleAIAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      const base64Data = await base64Promise;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Use standard contents object structure with parts as per guidelines
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: file.type } },
            { text: "حلل هذا التقرير أو القائمة واستخرج أسماء الأصناف، الكمية، واسم الوحدة. قم بالرد بصيغة JSON فقط." }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                productName: { type: Type.STRING },
                quantity: { type: Type.NUMBER },
                unitName: { type: Type.STRING }
              },
              required: ["productName", "quantity", "unitName"]
            }
          }
        }
      });

      // Use .text property to extract output
      const results = JSON.parse(response.text || "[]") as AIAnalyzedRow[];
      
      // مطابقة النتائج مع الأصناف الحالية
      const matchedResults = results.map(res => {
        const match = products.find(p => p.name.includes(res.productName) || res.productName.includes(p.name));
        return { ...res, matchedProductId: match?.id };
      });

      setAnalysisResults(matchedResults);
    } catch (error) {
      console.error("AI Analysis failed:", error);
      alert("فشل تحليل التقرير. تأكد من جودة الصورة.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const confirmAIStockAdd = () => {
    if (!analysisResults) return;
    
    const newProducts = [...products];
    analysisResults.forEach(res => {
      if (res.matchedProductId) {
        const pIdx = newProducts.findIndex(p => p.id === res.matchedProductId);
        if (pIdx > -1) {
          const product = newProducts[pIdx];
          let factor = 1;
          if (res.unitName !== product.baseUnit) {
            const sub = product.units.find(u => u.name === res.unitName);
            if (sub) factor = sub.factor;
          }
          newProducts[pIdx].currentStock += (res.quantity * factor);
        }
      }
    });
    setProducts(newProducts);
    setAnalysisResults(null);
    alert("تم تحديث المخزون بنجاح!");
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Box className="text-emerald-600" /> إدارة المخزون المستودعي
        </h2>
        <div className="flex gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => e.target.files?.[0] && handleAIAnalysis(e.target.files[0])}
            accept="image/*" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-xl shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            تحليل تقرير بالذكاء الاصطناعي
          </button>
        </div>
      </div>

      {analysisResults && (
        <div className="bg-emerald-50 border-2 border-emerald-200 p-6 rounded-2xl animate-in fade-in zoom-in duration-300">
          <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
            <CheckCircle size={20} /> نتائج تحليل التقرير - مراجعة قبل الإضافة
          </h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-right bg-white rounded-xl shadow-sm overflow-hidden">
              <thead className="bg-emerald-100 text-emerald-800">
                <tr>
                  <th className="p-3 border">الصنف المكتشف</th>
                  <th className="p-3 border">المطابقة في النظام</th>
                  <th className="p-3 border">الكمية</th>
                  <th className="p-3 border">الوحدة</th>
                </tr>
              </thead>
              <tbody>
                {analysisResults.map((res, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-3 border font-semibold">{res.productName}</td>
                    <td className="p-3 border">
                      {res.matchedProductId ? (
                        <span className="text-emerald-600 font-bold">{products.find(p => p.id === res.matchedProductId)?.name}</span>
                      ) : (
                        <span className="text-red-500 text-sm">غير موجود - سيتم تجاهله</span>
                      )}
                    </td>
                    <td className="p-3 border text-center font-bold">{res.quantity}</td>
                    <td className="p-3 border">{res.unitName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setAnalysisResults(null)} className="px-5 py-2 bg-slate-200 rounded-lg font-bold">إلغاء</button>
            <button onClick={confirmAIStockAdd} className="px-8 py-2 bg-emerald-600 text-white rounded-lg font-bold shadow-md hover:bg-emerald-700">تأكيد الإضافة للمخزون</button>
          </div>
        </div>
      )}

      <div className="relative mb-6">
        <Search className="absolute right-3 top-2.5 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="ابحث عن صنف في المخازن..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pr-10 pl-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase">{product.category}</span>
                <h4 className="text-lg font-bold text-slate-800">{product.name}</h4>
              </div>
              <div className={`p-2 rounded-lg ${product.currentStock < 10 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                <Box size={24} />
              </div>
            </div>
            
            <div className="text-center py-4 bg-slate-50 rounded-xl mb-6">
              <p className="text-xs text-slate-500 mb-1">الرصيد الحالي</p>
              <p className="text-3xl font-black text-slate-800">
                {product.currentStock} <span className="text-sm font-normal text-slate-500">{product.baseUnit}</span>
              </p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => updateStockManually(product.id, -1)}
                className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Minus size={16} /> 1
              </button>
              <button 
                onClick={() => updateStockManually(product.id, 1)}
                className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <Plus size={16} /> 1
              </button>
            </div>
            
            {product.currentStock < 5 && (
              <div className="mt-4 flex items-center gap-2 text-red-500 text-xs font-bold animate-pulse">
                <AlertCircle size={14} /> تنبيه: رصيد منخفض جداً
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryView;
