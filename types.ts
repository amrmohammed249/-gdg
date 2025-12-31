
export interface SubUnit {
  name: string;
  factor: number; // معامل التحويل من الوحدة الأساسية
}

export interface Product {
  id: string;
  name: string;
  baseUnit: string;
  purchasePrice: number;
  salePrice: number;
  category: string;
  units: SubUnit[];
  currentStock: number; // الرصيد الحالي بالوحدة الأساسية
}

export interface QuoteItem {
  id: string;
  productId: string;
  quantity: number;
  unitName: string; 
  factor: number;   
  pricePerUnit: number;
}

export interface Quote {
  id: string;
  customerName: string;
  date: string;
  items: QuoteItem[];
}

export interface AggregatedItem {
  productId: string;
  productName: string;
  baseUnit: string;
  totalInBaseUnit: number;
  totalPrice: number;
  category: string;
}

export interface AIAnalyzedRow {
  productName: string;
  quantity: number;
  unitName: string;
  matchedProductId?: string;
}
