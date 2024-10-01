/**
 * This module renders the `DefineProductForm` page, allowing users to declare a new product type or select from predefined categories.
 * The form supports dynamic switching between predefined products and custom product entries. 
 * It includes fields for product name, symbol, price, and a file upload feature for attaching relevant documents.
 * 
 * The form handles state management for both predefined and custom product types, providing feedback on successful or failed submissions, 
 * with a progress bar for visual indication of the submission process.
 * 
 * @see declareProductAction - Function to handle form submission to the server.
 * @see FileUpload2 - Component for file upload functionality.
 * 
 * @module
 */

'use client';

import { useState } from 'react';
import FileUpload2 from '@/app/components/FileUpload2';
import { declareProductAction } from './declareAction';
import productCategories from './commodities.json';

export default function DefineProductForm() {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [customProductName, setCustomProductName] = useState('');
  const [customSymbol, setCustomSymbol] = useState('');
  const [price, setPrice] = useState('');
  const [formState, setFormState] = useState<{ success: boolean | null; message: string }>({
    success: null,
    message: '',
  });
  const [progress, setProgress] = useState(100);
  const [isLoading, setIsLoading] = useState(false);

  // Check if form is valid
  function isFormValid(): boolean {
    return isAddingNew
      ? customProductName.trim() !== '' && customSymbol.trim() !== '' && parseFloat(price) > 0
      : selectedProduct !== '';
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === 'customProductName') setCustomProductName(value);
    else if (name === 'customSymbol') setCustomSymbol(value);
    else if (name === 'price') setPrice(value);
  };

  // Handle form submission
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true); // Start loading

    const formData = new FormData();
    if (isAddingNew) {
      formData.append('name', customProductName);
      formData.append('symbol', customSymbol);
      formData.append('price', price);
    } else {
      formData.append('selectedProduct', selectedProduct);
      const selected = Object.values(productCategories).flat().find((product) => product.name === selectedProduct);
      if (selected) {
        formData.append('name', selected.name);
        formData.append('symbol', selected.symbol);
        formData.append('price', selected.price.toString());
      }
    }

    const fileInputs = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInputs && fileInputs.files) {
      for (let i = 0; i < fileInputs.files.length; i++) {
        formData.append('files', fileInputs.files[i]);
      }
    }

        try {
            const result = await declareProductAction(formData);
            if (result) {
                setFormState({ success: result.success, message: result.message });
                const duration = 5000; // 5 seconds
                const interval = 50; // Update every 50ms for a smoother transition
                const step = 100 / (duration / interval);

        const timer = setInterval(() => {
          setProgress((prev) => {
            const newProgress = prev - step;
            if (newProgress <= 0) {
              clearInterval(timer);
              setFormState({ success: null, message: '' });
            }
            return newProgress;
          });
        }, interval);

        return () => clearInterval(timer);
      }
    } catch (error) {
      setFormState({ success: false, message: 'Form submission failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
        <h1 className="text-3xl font-light text-center text-blue-950 mb-8 underline decoration-green-500">
          Define new commodity
        </h1>

        <input
          type="checkbox"
          id="toggleNewProduct"
          name="isAddingNew"
          className="hidden peer"
          checked={isAddingNew}
          onChange={() => setIsAddingNew(!isAddingNew)}
        />

        {!isAddingNew && (
          <div className="peer-checked:hidden">
            <select
              id="product-select"
              name="selectedProduct"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="block w-full mt-1 p-2 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select a commodity...</option>
              {Object.entries(productCategories).map(([category, products]) => (
                <optgroup label={category} key={category}>
                  {products.map((product) => (
                    <option key={product.name} value={product.name}>
                      {product.name} ({product.symbol})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <label htmlFor="toggleNewProduct" className="mt-2 text-blue-500 hover:underline cursor-pointer">
              Can&apos;t find your commodity type? Add a new one
            </label>
          </div>
        )}

        {isAddingNew && (
          <div className="peer-checked:block">
            <div className="relative mb-4">
              <input
                type="text"
                name="customProductName"
                value={customProductName}
                onChange={handleInputChange}
                className="block w-full px-4 pt-6 pb-2 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 peer placeholder-transparent"
                placeholder="Name"
              />
              <label
                htmlFor="customProductName"
                className="absolute left-4 top-0.5 px-1 bg-white text-gray-600 text-base transition-all transform -translate-y-3 scale-75 origin-top-left peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-0.5 peer-focus:scale-75 peer-focus:text-blue-500 pointer-events-none"
              >
                Commodity
              </label>
            </div>

            <div className="relative mb-4">
              <input
                type="text"
                name="customSymbol"
                value={customSymbol}
                onChange={handleInputChange}
                className="block w-full px-4 pt-6 pb-2 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 peer placeholder-transparent"
                placeholder="Symbol"
              />
              <label
                htmlFor="customSymbol"
                className="absolute left-4 top-0.5 px-1 bg-white text-gray-600 text-base transition-all transform -translate-y-3 scale-75 origin-top-left peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-0.5 peer-focus:scale-75 peer-focus:text-blue-500 pointer-events-none"
              >
                Symbol
              </label>
            </div>

            <div className="relative mb-4">
              <input
                type="number"
                name="price"
                value={price}
                onChange={handleInputChange}
                className="block w-full px-4 pt-6 pb-2 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 peer placeholder-transparent"
                placeholder="Average Price"
              />
              <label
                htmlFor="price"
                className="absolute left-4 top-0.5 px-1 bg-white text-gray-600 text-base transition-all transform -translate-y-3 scale-75 origin-top-left peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-0.5 peer-focus:scale-75 peer-focus:text-blue-500 pointer-events-none"
              >
                Average price
              </label>
            </div>
          </div>
        )}

        <FileUpload2 /> {/* File Upload is now available in both cases */}

        <div className="text-right">
          <button
            type="submit"
            className={`px-4 py-2 text-white rounded ${isFormValid() ? (isLoading ? 'bg-green-500 cursor-wait' : 'bg-green-500 hover:bg-green-600') : 'bg-gray-400 cursor-not-allowed'}`}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? 'Submitting...' : 'Define commodity'}
          </button>
        </div>

        {formState.message && (
          <div
            id="form-feedback"
            className={`mt-8 p-4 mx-auto max-w-lg ${formState.success ? 'text-green-700 bg-green-100 border-green-400' : 'text-red-700 bg-red-100 border-red-400'} border rounded relative`}
            role="alert"
            aria-live="assertive"
          >
            {formState.message}
            <div
              className="h-1 bg-green-500 absolute bottom-0 left-0 transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </form>
    </div>
  );
}
