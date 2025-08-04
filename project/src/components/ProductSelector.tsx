import React from 'react';
import { ChevronDown } from 'lucide-react';
import { PRODUCT_TYPES, ProductType } from '../config';

interface ProductSelectorProps {
  selectedProduct: ProductType;
  onProductChange: (product: ProductType) => void;
}

export default function ProductSelector({ selectedProduct, onProductChange }: ProductSelectorProps) {
  return (
    <div className="relative mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Product Type
      </label>
      <div className="relative">
        <select
          value={selectedProduct}
          onChange={(e) => onProductChange(e.target.value as ProductType)}
          className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
        >
          {PRODUCT_TYPES.map((product) => (
            <option key={product.value} value={product.value}>
              {product.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}