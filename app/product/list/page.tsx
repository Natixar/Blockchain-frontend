/**
 * This component renders a unified product listing page where users can filter, sort, and view products.
 * It allows users to filter products by name, quantity, and CO2 emission. Sorting options are available by name, quantity, or CO2, 
 * with support for ascending and descending order. Users can also specify a range for quantity and CO2 emissions.
 * 
 * The component manages state for filtering, sorting, and range inputs, and it fetches product data based on user input.
 * The data is displayed in a grid layout, where each product is clickable for further details.
 * @module
 */

'use client';

import { useEffect, useState } from 'react';
import { Product } from '../Tproduct';
import { Mine_1 } from '@/app/blockchain/src/setupAccounts';
import Link from 'next/link';

async function fetchProducts(accountAddress: string): Promise<Product[]> {
  const response = await fetch(
    `/blockchain/api/product/list?accountAddress=${accountAddress}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  const data = await response.json();
  return data;
}

export default function UnifiedProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('');
  const [quantityRange, setQuantityRange] = useState<[number, number]>([0, 100000]);
  const [co2Range, setCO2Range] = useState<[number, number]>([0, 100000]);
  const [maxQuantity, setMaxQuantity] = useState(10000);
  const [maxCO2, setMaxCO2] = useState(1000);
  const accountAddress = Mine_1.address; // Change this to dynamically fetch the account based on user role or selection

  useEffect(() => {
    const fetchData = async () => {
      const products = await fetchProducts(accountAddress);
      setProducts(products);
      setMaxQuantity(Math.max(...products.map((product) => product.quantity)));
      setMaxCO2(Math.max(...products.map((product) => product.co2!)));
    };
    fetchData();
  });

  // Filtering logic
  const filteredProducts = products.filter((product) => {
    const matchesFilter =
      product.name.toLowerCase().includes(filter.toLowerCase()) ||
      product.symbol.toLowerCase().includes(filter.toLowerCase());
    
    const matchesQuantityRange =
      product.quantity >= quantityRange[0] && product.quantity <= quantityRange[1];

    const matchesCO2Range =
      product.co2! >= co2Range[0] && product.co2! <= co2Range[1];

    return matchesFilter && matchesQuantityRange && matchesCO2Range;
  });

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-light text-center text-blue-950 mb-8 underline decoration-green-500">Commodities stock</h1>
      
      {/* Filter Bar */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-12 mb-6 items-end">
        {/* Freeform Input for Filtering by Name and Symbol */}
        <input
          type="text"
          placeholder="Search by Name, Symbol..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 h-10 rounded col-span-12 lg:col-span-3"
        />

        {/* Quantity Range Filter */}
        <div className="col-span-12 lg:col-span-3">
          <label className="text-gray-700 text-sm">Quantity Range (tons)</label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={quantityRange[0]}
              onChange={(e) => setQuantityRange([Number(e.target.value), quantityRange[1]])}
              className="px-2 py-1 border rounded w-full text-sm bg-white text-gray-900"
              max={maxQuantity}
            />
            <input
              type="number"
              placeholder="Max"
              value={quantityRange[1]}
              onChange={(e) => setQuantityRange([quantityRange[0], Number(e.target.value)])}
              className="px-2 py-1 border rounded w-full text-sm bg-white text-gray-900"
              max={maxQuantity}
            />
          </div>
        </div>

        {/* CO2 Range Filter */}
        <div className="col-span-12 lg:col-span-3">
          <label className="text-gray-700 text-sm">CO2 Range (tons)</label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={co2Range[0]}
              onChange={(e) => setCO2Range([Number(e.target.value), co2Range[1]])}
              className="px-2 py-1 border rounded w-full text-sm bg-white text-gray-900"
              max={maxCO2}
            />
            <input
              type="number"
              placeholder="Max"
              value={co2Range[1]}
              onChange={(e) => setCO2Range([co2Range[0], Number(e.target.value)])}
              className="px-2 py-1 border rounded w-full text-sm bg-white text-gray-900"
              max={maxCO2}
            />
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(product => (
          <div key={product.address} className="border p-4 rounded shadow bg-white">
            <h2 className="text-lg font-semibold">
              <Link href={`/product/list/${product.address}`} className="text-blue-500 hover:underline">
                {product.name}
              </Link>
            </h2>
            <p>Quantity: {product.quantity} tons</p>
            <p>CO2eq: {product.co2} tons</p>
            <p>
              <Link href={`/product/list/${product.address}`} className="text-blue-500 hover:underline">
                View Details
              </Link>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
