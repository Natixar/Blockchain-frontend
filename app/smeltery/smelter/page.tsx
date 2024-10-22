/**
 * SmelteringForm component provides a form interface for the smeltering process in a blockchain application.
 * This component allows users to select raw materials (used products), specify quantities and units (kg or tons),
 * and designate resulting products for transformation. It integrates with a blockchain API to submit transformation data.
 *
 * @remarks
 * - The component fetches the user's products on mount and populates selection options for both used and resulting products.
 * - Units are converted to kilograms before submitting the form, as the API only accepts quantities in kilograms.
 * - Users can navigate the product selection dropdown using arrow keys, and select a product with the Enter key.
 * - The form is only submitted if all required fields are correctly filled out, ensuring data integrity.
 * - The component is built using React hooks (`useState`, `useEffect`, `useRef`) and leverages Tailwind CSS for styling.
 * - Accessibility features include ARIA attributes and keyboard navigation for a better user experience.
 * @module
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ProductSelect from './ProductSelect';
import { Product } from '@/app/product/Tproduct';

const units = ['kg', 't'];

export default function SmelteringForm() {
  const [products, setProducts] = useState<Product[]>([]);
  const [usedProducts, setUsedProducts] = useState<Product[]>([]);
  const [resultingProducts, setResultingProducts] = useState<Product[]>([]);
  const [co2Emission, setCo2Emission] = useState('');
  const [co2Unit, setCo2Unit] = useState('t'); // Default unit for CO2 is metric ton
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    async function fetchUserProducts() {
      try {
        const response = await fetch(`/product/getProducts`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    }
    fetchUserProducts();
  }, []);

  const isFormValid = (): boolean => {
    return (
      usedProducts.length > 0 &&
      resultingProducts.length > 0 &&
      co2Emission.trim() !== '' &&
      usedProducts.every((product) => product.quantity > 0) &&
      resultingProducts.every((product) => product.quantity > 0)
    );
  };

  const handleAddUsedProduct = () => {
    setUsedProducts([...usedProducts, { address: '', name: '', symbol: '', quantity: 0, unit: 'kg' }]);
  };

  const handleAddResultingProduct = () => {
    setResultingProducts([...resultingProducts, { address: '', name: '', symbol: '', quantity: 0, unit: 'kg' }]);
  };

  const handleProductChange = (
    products: Product[],
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
    index: number,
    key: keyof Product,
    value: any
  ) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], [key]: value };
    setProducts(updatedProducts);
  };

  const handleRemoveProduct = (products: Product[], setProducts: React.Dispatch<React.SetStateAction<Product[]>>, index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  
    if (!isFormValid()) return;
  
    const input = usedProducts.map((prod) => ({
      product: prod.address,
      amount: prod.unit === 't' ? prod.quantity * 1000 : prod.quantity, // Convert to kg if in tons
    }));
  
    const output = resultingProducts.map((prod) => ({
      product: prod.address,
      amount: prod.unit === 't' ? prod.quantity * 1000 : prod.quantity, // Convert to kg if in tons
    }));
  
    // Convert CO2 to kg if the unit is metric ton
    const co2EmissionInKg = co2Unit === 't' ? parseFloat(co2Emission) * 1000 : parseFloat(co2Emission);
  
    const requestData = {
      input,
      output,
      footprint: co2EmissionInKg,
    };
  
    try {
      const response = await fetch('/api/product/smelter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const responseJson = await response.json();
      console.log('Smeltering successful:', responseJson);
  
      router.push('/product/list');
    } catch (error) {
      console.error('Failed to submit smeltering data:', error);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-light text-center text-blue-950 mb-8 underline decoration-green-500">
        Smelt commodities
      </h1>
      <form onSubmit={handleSubmit} ref={formRef} className="space-y-4 max-w-lg mx-auto">
        <div>
          <h3 className="font-medium">Process inputs</h3>
          {usedProducts.map((product, index) => (
            <div key={index} className="flex space-x-2 items-center mt-2">
              <div className="flex-1">
                <ProductSelect
                  products={products}
                  selectedProduct={products.find((prod) => prod.address === product.address) || null}
                  setSelectedProduct={(selectedProduct) =>
                    handleProductChange(usedProducts, setUsedProducts, index, 'address', selectedProduct?.address || null)
                  }
                  placeholder="Select commodity"
                />
              </div>
              <input
                type="number"
                placeholder="0"
                value={product.quantity === 0 ? '' : product.quantity}
                onChange={(e) =>
                  handleProductChange(usedProducts, setUsedProducts, index, 'quantity', parseInt(e.target.value, 10) || 0)
                }
                className="border p-2 w-1/4 focus:ring-blue-500"
              />
              <select
                value={product.unit}
                onChange={(e) => handleProductChange(usedProducts, setUsedProducts, index, 'unit', e.target.value)}
                className="border p-2 w-auto bg-white h-full"
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="text-red-500"
                onClick={() => handleRemoveProduct(usedProducts, setUsedProducts, index)}
              >
                &times;
              </button>
            </div>
          ))}
          <button
            type="button"
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
            onClick={handleAddUsedProduct}
          >
            Add
          </button>
        </div>

        <div>
          <h3 className="font-medium">Process outputs</h3>
          {resultingProducts.map((product, index) => (
            <div key={index} className="flex space-x-2 items-center mt-2">
              <div className="flex-1">
                <ProductSelect
                  products={products}
                  selectedProduct={products.find((prod) => prod.address === product.address) || null}
                  setSelectedProduct={(selectedProduct) =>
                    handleProductChange(resultingProducts, setResultingProducts, index, 'address', selectedProduct?.address || null)
                  }
                  placeholder="Select commodity"
                />
              </div>
              <input
                type="number"
                placeholder="0"
                value={product.quantity === 0 ? '' : product.quantity}
                onChange={(e) =>
                  handleProductChange(resultingProducts, setResultingProducts, index, 'quantity', parseInt(e.target.value, 10) || 0)
                }
                className="border p-2 w-1/4 focus:ring-blue-500"
              />
              <select
                value={product.unit}
                onChange={(e) => handleProductChange(resultingProducts, setResultingProducts, index, 'unit', e.target.value)}
                className="border p-2 w-auto bg-white h-full"
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="text-red-500"
                onClick={() => handleRemoveProduct(resultingProducts, setResultingProducts, index)}
              >
                &times;
              </button>
            </div>
          ))}
          <button
            type="button"
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
            onClick={handleAddResultingProduct}
          >
            Add
          </button>
        </div>

        <div>
          <h3 className="font-medium">Total CO2eq</h3>
          <div className="flex space-x-2 items-center mt-2">
            <input
              type="number"
              name="co2Emission"
              id="co2Emission"
              value={co2Emission}
              onChange={(e) => setCo2Emission(e.target.value)}
              className="border p-2 w-full focus:ring-blue-500"
              placeholder="Enter CO2eq"
            />
            <select
              value={co2Unit}
              onChange={(e) => setCo2Unit(e.target.value)}
              className="border p-2 bg-white h-full"
            >
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-right">
          <button
            type="submit"
            className={`px-4 py-2 text-white rounded ${isFormValid() ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
            disabled={!isFormValid()}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
