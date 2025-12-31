
import { Product } from './types';

export const DEFAULT_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'عدس', 
    baseUnit: 'كيلو', 
    purchasePrice: 40, 
    salePrice: 50, 
    category: 'بقوليات',
    units: [{ name: 'شوال', factor: 50 }],
    // Added currentStock to fix missing property error
    currentStock: 0
  },
  { 
    id: '2', 
    name: 'لوبيا', 
    baseUnit: 'كيلو', 
    purchasePrice: 60, 
    salePrice: 75, 
    category: 'بقوليات',
    units: [{ name: 'شوال', factor: 40 }],
    // Added currentStock to fix missing property error
    currentStock: 0
  }
];
