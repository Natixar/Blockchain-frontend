/** 
 * This page component renders a form for creating a new blockchain transaction.
 * Users can select a product, specify the sender and recipient, choose a transporter, and input the quantity of the product.
 * The form also supports unit conversion, and the transaction details are submitted to a backend API for processing.
 * 
 * The component manages state for the transaction details, products, groups, form validation, loading status, and error handling.
 * @module
 */

'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';

interface Product {
  name: string;
  address: string;
  quantity: number;
}

interface Group {
  name: string;
  blockchainAddress: string;
}

interface Transaction {
  address: string;
  from: string;
  to: string;
  transporter: string;
  product: string;
  quantity: number;
}

export default function CreateTransaction() {
  const [transaction, setTransaction] = useState<Transaction>({
    address: '',
    from: '',
    to: '',
    transporter: '',
    product: '',
    quantity: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [unit, setUnit] = useState('t');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTransactionSuccessful, setIsTransactionSuccessful] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(100);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(`/product/getProducts`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setErrorMessage('Failed to fetch products');
      }
    }

    async function fetchGroups() {
      try {
        const groupResponse = await fetch('/transactions/create/getGroups');
        if (!groupResponse.ok) {
          throw new Error('Failed to fetch groups');
        }
        const data = await groupResponse.json();
        setGroups(data);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setErrorMessage('Failed to fetch groups');
      }
    }

    fetchProducts();
    fetchGroups();
  }, []);

  const isFormValid = (): boolean => {
    return (
      transaction.from !== '' &&
      transaction.to !== '' &&
      transaction.transporter !== '' &&
      transaction.product !== '' &&
      transaction.quantity > 0 &&
      selectedProduct !== null &&
      transaction.quantity <= selectedProduct.quantity
    );
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'product') {
      const selected = products.find((product) => product.address === value) || null;
      setSelectedProduct(selected);
    }

    if (name === 'quantity') {
      const quantity = parseInt(value, 10) || 0;
      if (selectedProduct && (quantity < 1 || quantity > selectedProduct.quantity)) {
        setErrorMessage(`Quantity must be between 1 and ${selectedProduct.quantity}`);
      } else {
        setErrorMessage(null);
      }
    }

    setTransaction((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value, 10) || 0 : value,
    }));

    setIsTransactionSuccessful(false);
  };

  /**
   * Convert quantity to kg based on the selected unit.
   * @param {number} quantity - The quantity input value.
   * @param {string} unit - The selected unit.
   * @returns {number} - The converted quantity in kilograms.
   */
  const convertToKg = (quantity: number, unit: string): number => {
    let quantityInKg = parseFloat(quantity.toString() || '0');
    if (unit === 't') {
      quantityInKg *= 1000;
    } else if (unit === 'short t') {
      quantityInKg *= 907.2;
    } else if (unit === 'long t') {
      quantityInKg *= 1016.047;
    }
    return quantityInKg;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid()) {
      setErrorMessage('Please fill out all fields correctly.');
      return;
    }

    setIsLoading(true);
    try {
      const quantityInKg = convertToKg(transaction.quantity, unit);

      const packageData = {
        from: transaction.from,
        to: transaction.to,
        transporterEmail: transaction.transporter,
        product: transaction.product,
        quantity: quantityInKg, // Send quantity in kilograms to the API
      };

      const response = await fetch('/transactions/create/createPackage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packageData),
      });

      if (!response.ok) {
        if (response.status >= 500) {
          throw new Error('Server error, please try again later.');
        } else {
          throw new Error('Failed to create package due to client error.');
        }
      }

      setErrorMessage(null);
      setIsTransactionSuccessful(true);
      setProgress(100);
      setTimeout(() => setProgress(0), 100);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to create transaction');
      setIsTransactionSuccessful(false);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setProgress(100);
        setErrorMessage(null);
      }, 5000);
    }
  };

  return (
    <section className="max-w-lg mx-auto">
      <h1 className="text-3xl font-light text-center text-blue-950 mb-8 underline decoration-green-500">
        Create new transaction
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <fieldset aria-label="Transaction Details">
          {/* Form Fields */}
          <div className="relative">
            <select
              name="from"
              value={transaction.from}
              onChange={handleChange}
              className="block w-full px-4 py-4 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              aria-label="From"
              required
            >
              <option value="">From company</option>
              {groups.map((entity) => (
                <option key={entity.blockchainAddress} value={entity.blockchainAddress}>
                  {entity.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              name="to"
              value={transaction.to}
              onChange={handleChange}
              className="block w-full mt-6 px-4 py-4 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              aria-label="To"
              required
            >
              <option value="">To company</option>
              {groups.map((entity) => (
                <option key={entity.blockchainAddress} value={entity.blockchainAddress}>
                  {entity.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <input
              type="email"
              name="transporter"
              value={transaction.transporter}
              onChange={handleChange}
              className="block w-full mt-6 px-4 py-4 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 peer placeholder-transparent"
              placeholder="Transporter Email"
              aria-label="Transporter Email"
              required
            />
            <label
              htmlFor="transporter"
              className="absolute left-4 top-0.5 px-1 bg-white text-gray-600 text-base transition-all transform -translate-y-3 scale-75 origin-top-left peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-0.5 peer-focus:scale-75 peer-focus:text-blue-500 pointer-events-none"
            >
              Transporter&apos;s email
            </label>
          </div>

          <div className="relative">
            <select
              name="product"
              value={transaction.product}
              onChange={handleChange}
              className="block w-full mt-6 px-4 py-5 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              aria-label="Product Name"
              required
            >
              <option value="">Select commodity</option>
              {products.map((product) => (
                <option key={product.address} value={product.address}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity and Unit Selection */}
          <div className="flex space-x-2 items-center mt-6">
            <div className="relative flex-grow">
              <input
                type="number"
                name="quantity"
                value={transaction.quantity === 0 ? '' : transaction.quantity}
                onChange={handleChange}
                className="block w-full px-4 py-4 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 peer placeholder-transparent"
                placeholder="Quantity"
                aria-label="Quantity"
                required
                min={1}
                max={selectedProduct ? selectedProduct.quantity : undefined}
              />
              <label className="absolute left-4 top-0.5 px-1 bg-white text-gray-600 text-base transition-all transform -translate-y-3 scale-75 origin-top-left peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-0.5 peer-focus:scale-75 peer-focus:text-blue-500 pointer-events-none">
                Quantity
              </label>
            </div>
            <div className="relative w-1/4">
              <select
                name="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="block w-full px-4 py-5 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                aria-label="Unit"
              >
                <option value="kg">kg</option>
                <option value="t">Metric ton</option>
                <option value="short t">Short ton</option>
                <option value="long t">Long ton</option>
              </select>
            </div>
          </div>

          <div className="text-right">
            <button
              type="submit"
              className={`px-4 py-2 mt-6 text-white rounded ${isFormValid()
                ? isLoading
                  ? 'bg-green-500 cursor-wait'
                  : 'bg-green-500 hover:bg-green-600'
                : 'bg-gray-400 cursor-not-allowed'
                }`}
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Create transaction'
              )}
            </button>
          </div>
        </fieldset>
      </form>

      {errorMessage && (
        <div className="mt-8 p-4 mx-auto max-w-lg text-red-700 bg-red-100 border-red-400 border rounded relative" role="alert">
          {errorMessage}
          <div
            className="absolute bottom-0 left-0 h-1 bg-red-500 transition-all"
            style={{ width: `${progress}%`, transition: 'width 5s linear' }}
          ></div>
        </div>
      )}

      {isTransactionSuccessful && (
        <div
          className="mt-8 p-4 mx-auto max-w-lg text-green-700 bg-green-100 border-green-400 border rounded relative"
          role="alert"
        >
          Transaction saved successfully! Go back to the{' '}
          <Link href="/transactions/list" className="text-blue-500 underline">
            transactions list
          </Link>
          <div
            className="absolute bottom-0 left-0 h-1 bg-green-500 transition-all"
            style={{ width: `${progress}%`, transition: 'width 5s linear' }}
          ></div>
        </div>
      )}
    </section>
  );
}
