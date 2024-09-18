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

async function fetchProducts(
  accountAddress: string,
  filter = '',
  sort = '',
  order = 'asc',
  quantityRange = [0, 100000],
  co2Range = [0, 1000]
): Promise<Product[]> {
  const response = await fetch(
    `/blockchain/api/product/list?accountAddress=${accountAddress}&filter=${filter}&sort=${sort}&order=${order}&minQuantity=${quantityRange[0]}&maxQuantity=${quantityRange[1]}&minCO2=${co2Range[0]}&maxCO2=${co2Range[1]}`
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
  const [sort, setSort] = useState('');
  const [order, setOrder] = useState('asc');
  const [quantityRange, setQuantityRange] = useState<[number, number]>([0, 100000]);
  const [co2Range, setCO2Range] = useState<[number, number]>([0, 100000]);
  const [maxQuantity, setMaxQuantity] = useState(10000);
  const [maxCO2, setMaxCO2] = useState(1000);
  const accountAddress = Mine_1.address; // Change this to dynamically fetch the account based on user role or selection

  useEffect(() => {
    const fetchData = async () => {
      const products = await fetchProducts(accountAddress, filter, sort, order, quantityRange, co2Range);
      setProducts(products);
      setMaxQuantity(Math.max(...products.map((product) => product.quantity)));
      setMaxCO2(Math.max(...products.map((product) => product.co2!)));
    };
    fetchData();
  }, [accountAddress, filter, sort, order, quantityRange, co2Range]);

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-light text-center mb-8 underline decoration-green-500">Products List</h1>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-10 mb-6 items-end">
        <input
          type="text"
          placeholder="Filter products..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 h-10 rounded col-span-10 lg:col-span-2"
        />
        <div className="flex space-x-2 col-span-10 lg:col-span-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border p-2 h-10 rounded w-full bg-white"
          >
            <option value="">Sort By</option>
            <option value="name">Name</option>
            <option value="quantity">Quantity</option>
            <option value="co2">CO2 Emission</option>
          </select>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="border p-2 h-10 rounded w-full bg-white"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <div className="col-span-10 lg:col-span-3">
          <label className="text-gray-700 text-sm">Quantity Range</label>
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
        <div className="col-span-10 lg:col-span-3">
          <label className="text-gray-700 text-sm">CO2 Range</label>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.address} className="border p-4 rounded shadow bg-white">
            <h2 className="text-lg font-semibold">
              <Link href={`/product/list/${product.address}`} className="text-blue-500 hover:underline">
                {product.name}
              </Link>
            </h2>
            <p>Quantity: {product.quantity} Kg</p>
            <p>CO2 Emission: {product.co2} Kg</p>
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
