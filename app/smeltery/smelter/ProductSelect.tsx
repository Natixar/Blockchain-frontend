'use client';

import { Product } from '@/app/product/Tproduct';
import { useState, useEffect, useRef } from 'react';

interface ProductSelectProps {
  products: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  placeholder: string;
}

const ProductSelect = ({ products, selectedProduct, setSelectedProduct, placeholder }: ProductSelectProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase())));
    }
  }, [searchTerm, products]);

  useEffect(() => {
    if (highlightedIndex !== -1 && dropdownRef.current) {
      const highlightedItem = dropdownRef.current.children[highlightedIndex] as HTMLElement;
      highlightedItem.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchTerm(product.name);
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prevIndex =>
          Math.min(prevIndex + 1, filteredProducts.length - 1)
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prevIndex => Math.max(prevIndex - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredProducts.length) {
          handleSelectProduct(filteredProducts[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={selectedProduct ? selectedProduct.name : searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        onKeyDown={handleKeyDown}
        className="border p-2 w-full"
        placeholder={placeholder}
      />
      {showDropdown && (
        <div
          className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto"
          ref={dropdownRef}
        >
          {filteredProducts.map((product, index) => (
            <div
              key={product.address}
              className={`cursor-pointer p-2 ${index === highlightedIndex ? 'bg-gray-200' : ''}`}
              onMouseDown={() => handleSelectProduct(product)}
            >
              {product.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductSelect;
