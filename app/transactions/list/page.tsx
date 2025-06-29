/** 
 * This page component displays blockchain transactions with sorting and filtering capabilities.
 * Users can filter transactions by search terms (address, product, etc.), price range, quantity, and CO2 emissions.
 * Users can also sort by various fields such as address, quantity, price, and CO2 emissions.
 * The component manages the state of transactions, filtering, sorting, and error handling.
 * @module
 */

'use client';

import { useEffect, useState } from 'react';
import { Transaction } from '../Ttransaction';

async function fetchTransactions(): Promise<any> {
  try {
    const response = await fetch(`/transactions/getTransactions`);
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Error fetching transactions:', error);
  }
}

type SortField = keyof Transaction | 'quantity' | 'price' | 'co2' | 'name';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [amountRange, setAmountRange] = useState<[number, number]>([0, 100000]); // Price range
  const [quantityRange, setQuantityRange] = useState<[number, number]>([0, 1000]); // Quantity range in tons
  const [co2Range, setCo2Range] = useState<[number, number]>([0, 1000]); // CO2 range in tons
  const [showArchived, setShowArchived] = useState(false);
  const [sortField, setSortField] = useState<SortField>('address');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const transactions: Transaction[] = await fetchTransactions();
        const roundedData = transactions.map((transaction) => ({
          ...transaction,
          product: {
            ...transaction.product,
            price: Math.round(transaction.product.price),
            quantity: parseFloat((transaction.product.quantity / 1000).toFixed(2)), // Convert kg to tons
            co2: parseFloat((transaction.product.co2 / 1000).toFixed(2)), // Convert kg to tons
          },
        }));
        setTransactions(roundedData);
      } catch (err) {
        setError('Failed to fetch transactions');
      }
    };
    fetchData();
  }, []);

  const handleSort = (field: SortField) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);
  };

  const getFieldValue = (transaction: Transaction, field: SortField) => {
    switch (field) {
      case 'quantity':
        return transaction.product.quantity;
      case 'price':
        return transaction.product.price;
      case 'co2':
        return transaction.product.co2;
      case 'name':
        return transaction.product.name;
      default:
        return transaction[field];
    }
  };

  // Apply search filter, quantity range, CO2 range, and amount range filter
  const filteredTransactions = transactions.filter((transaction) => {
    const searchFilterLowerCase = searchFilter.toLowerCase(); // Case-insensitive filter

    const searchMatch =
      searchFilterLowerCase === '' ||
      transaction.address.toLowerCase().includes(searchFilterLowerCase) ||
      transaction.from.toLowerCase().includes(searchFilterLowerCase) ||
      transaction.to.toLowerCase().includes(searchFilterLowerCase) ||
      transaction.product.name.toLowerCase().includes(searchFilterLowerCase) ||
      transaction.product.symbol.toLowerCase().includes(searchFilterLowerCase);

    const amountMatch =
      transaction.product.price >= amountRange[0] && transaction.product.price <= amountRange[1];

    const quantityMatch =
      transaction.product.quantity >= quantityRange[0] && transaction.product.quantity <= quantityRange[1];

    const co2Match =
      transaction.product.co2 >= co2Range[0] && transaction.product.co2 <= co2Range[1];

    return searchMatch && amountMatch && quantityMatch && co2Match;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const fieldA = getFieldValue(a, sortField);
    const fieldB = getFieldValue(b, sortField);

    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortOrder === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
    } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
      return sortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA;
    }

    return 0;
  });

  return (
    <main className="mx-auto">
      <h1 className="text-3xl font-light text-center mb-8 underline decoration-green-500">Transactions</h1>
      <div className="sticky top-0 bg-white z-10">
        <div className="flex flex-col space-y-2 mb-4 md:flex-row md:items-center p-2 md:space-x-4">
          <div className="flex items-center justify-center md:justify-start md:order-1 ml-4">
            <div className="flex items-center space-x-2">
              <span>Current</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={() => setShowArchived(!showArchived)}
                  className="sr-only peer z-0"
                  data-testid="show-archived-switch"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
              <span>Archived</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:space-x-4 md:order-2 space-y-2 md:space-y-0 w-full">
            <input
              type="text"
              placeholder="Search by ID, Commodity, Symbol, From, To..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="border p-1 text-sm rounded h-10 w-full md:w-96"
              aria-label="Unified search"
              data-testid="search-filter-input"
            />
          </div>

          <fieldset className="flex flex-col md:flex-row items-center border rounded px-2 pb-1 md:order-3 w-full md:w-auto">
            <legend className="text-gray-700 text-sm">Quantity (tons)</legend>
            <div className="flex space-x-2 items-center mt-2 md:mt-0">
              <input
                id="minQuantity"
                type="number"
                placeholder="Min"
                value={quantityRange[0]}
                onChange={(e) => setQuantityRange([Number(e.target.value), quantityRange[1]])}
                className="px-2 py-1 border rounded w-1/2 text-sm bg-white text-gray-900"
                max={quantityRange[1]}
                aria-label="Min quantity"
                data-testid="min-quantity-input"
              />
              <input
                id="maxQuantity"
                type="number"
                placeholder="Max"
                value={quantityRange[1]}
                onChange={(e) => setQuantityRange([quantityRange[0], Number(e.target.value)])}
                className="px-2 py-1 border rounded w-1/2 text-sm bg-white text-gray-900"
                min={quantityRange[0]}
                aria-label="Max quantity"
                data-testid="max-quantity-input"
              />
            </div>
          </fieldset>

          <fieldset className="flex flex-col md:flex-row items-center border rounded px-2 pb-1 md:order-4 w-full md:w-auto">
            <legend className="text-gray-700 text-sm">CO2eq (tons)</legend>
            <div className="flex space-x-2 items-center mt-2 md:mt-0">
              <input
                id="minCO2"
                type="number"
                placeholder="Min"
                value={co2Range[0]}
                onChange={(e) => setCo2Range([Number(e.target.value), co2Range[1]])}
                className="px-2 py-1 border rounded w-1/2 text-sm bg-white text-gray-900"
                max={co2Range[1]}
                aria-label="Min CO2"
                data-testid="min-co2-input"
              />
              <input
                id="maxCO2"
                type="number"
                placeholder="Max"
                value={co2Range[1]}
                onChange={(e) => setCo2Range([co2Range[0], Number(e.target.value)])}
                className="px-2 py-1 border rounded w-1/2 text-sm bg-white text-gray-900"
                min={co2Range[0]}
                aria-label="Max CO2"
                data-testid="max-co2-input"
              />
            </div>
          </fieldset>
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* Table layout for desktop */}
      <div className="hidden lg:block">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('address')}>
                ID {sortField === 'address' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('name')}>
                Commodity {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('from')}>
                From {sortField === 'from' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('to')}>
                To {sortField === 'to' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('quantity')}>
                Quantity (Tons) {sortField === 'quantity' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('price')}>
                Price ($) {sortField === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('co2')}>
                CO2eq (Tons) {sortField === 'co2' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className="text-center">
            {sortedTransactions.map((transaction) => (
              <tr key={transaction.address}>
                <td className="py-2 px-4 border-b">
                  {transaction.address}
                </td>
                <td className="py-2 px-4 border-b">
                  {transaction.product.name} ({transaction.product.symbol})
                </td>
                <td className="py-2 px-4 border-b">{transaction.from}</td>
                <td className="py-2 px-4 border-b">{transaction.to}</td>
                <td className="py-2 px-4 border-b">{transaction.product.quantity}</td>
                <td className="py-2 px-4 border-b">{transaction.product.price}</td>
                <td className="py-2 px-4 border-b">{transaction.product.co2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary cards for mobile */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {sortedTransactions.map((transaction) => (
          <div key={transaction.address} className="border rounded-md p-4 shadow-sm bg-white hover:shadow-md">
              <div className="text-lg font-semibold">{transaction.product.name} ({transaction.product.symbol})</div>
              <div className="text-sm text-gray-600">Address: {transaction.address}</div>
              <div className="text-sm text-gray-600">From: {transaction.from}</div>
              <div className="text-sm text-gray-600">To: {transaction.to}</div>
              <div className="text-sm text-gray-600">Quantity: {transaction.product.quantity} Tons</div>
              <div className="text-sm text-gray-600">Price: {transaction.product.price} $</div>
              <div className="text-sm text-gray-600">CO2eq: {transaction.product.co2} Tons</div>
              <div className="mt-2 text-blue-600 text-sm">View Details</div>
          </div>
        ))}
      </div>
    </main>
  );
}
