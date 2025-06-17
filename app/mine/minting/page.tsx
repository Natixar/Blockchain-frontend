/**
 * This component renders a form for minting new minerals on the blockchain. 
 * Users can select a mineral, specify the quantity, choose a unit (kg, metric ton, etc.), and input CO2 emissions for the minting process. 
 * The form includes validation for the input fields and sends a request to the backend API to mint the selected mineral.
 * 
 * The component manages state for the minerals, selected commodity, quantity, unit, CO2 emissions, and form submission status. 
 * It also handles form validation, loading indicators, and displays feedback messages for success or failure.
 * 
 * @module
 */

'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/app/product/Tproduct';

export default function MintingForm() {
  const [minerals, setMinerals] = useState<Product[]>([]);
  const [selectedMineralAddress, setSelectedMineralAddress] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [quantityUnit, setQuantityUnit] = useState('t'); // Separate unit for quantity
  const [co2, setCo2] = useState<string>('');
  const [co2Unit, setCo2Unit] = useState('t'); // Separate unit for CO2
  const [formState, setFormState] = useState<{ success: boolean | null; message: string }>({
    success: null,
    message: '',
  });
  const [progress, setProgress] = useState(100);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchMinerals() {
      try {
        const response = await fetch(`/product/getProducts`);
        if (!response.ok) {
          throw new Error('Failed to fetch minerals');
        }
        const data = await response.json();
        setMinerals(data);

        if (data.length === 1) {
          setSelectedMineralAddress(data[0].address);
        }
      } catch (error) {
        console.log('Failed to fetch minerals:', error);
      }
    }
    
    fetchMinerals();
  }, []);

  useEffect(() => {
    try {
      const valid = 
        selectedMineralAddress !== '' && 
        parseFloat(quantity || '0') > 0 && 
        parseFloat(co2 || '0') >= 0;
      setIsFormValid(valid);
    } catch (error) {
      setIsFormValid(false);
    }
  }, [selectedMineralAddress, quantity, co2]);

  // Fixed handleSelectChange function
  function handleSelectChange(event:any) {
    try {
      const value = event.target.value;
      console.log("Select changed - value:", value);
      
      // Force update with setTimeout to ensure React processes the state change
      setTimeout(() => {
        setSelectedMineralAddress(value);
      }, 0);
    } catch (error) {
      console.error("Error in select change:", error);
    }
  }

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    
    if (!isFormValid) return;
    
    setIsLoading(true);

    try {
      // Convert quantity to kg
      let quantityInKg = parseFloat(quantity || '0');
      if (quantityUnit === 't') quantityInKg *= 1000;
      else if (quantityUnit === 'short t') quantityInKg *= 907.2;
      else if (quantityUnit === 'long t') quantityInKg *= 1016.047;

      // Convert CO2 to kg
      let co2InKg = parseFloat(co2 || '0');
      if (co2Unit === 't') co2InKg *= 1000;
      else if (co2Unit === 'short t') co2InKg *= 907.2;
      else if (co2Unit === 'long t') co2InKg *= 1016.047;

      const selected = minerals.find(m => m.address === selectedMineralAddress);
      
      if (!selected) {
        throw new Error('No mineral selected');
      }
      
      const response = await fetch('/mine/minting/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodityAddress: selectedMineralAddress,
          quantity: quantityInKg,
          footprint: co2InKg,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Server error');
      }
      
      setFormState({ success: true, message: 'Successfully minted!' });
    } catch (error:any) {
      setFormState({ success: false, message: error.message || 'Error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserInput = () => {
    setFormState({ success: null, message: '' });
  };

  return (
    <section className="max-w-lg mx-auto p-4">
      <h1 className="text-3xl font-light text-center text-blue-950 mb-8">Minting commodity</h1>
      
      <form onSubmit={handleSubmit} onChange={handleUserInput} className="space-y-6">
        {/* Mineral Selection - SIMPLIFIED */}
        {minerals.length === 1 ? (
          <div className="p-4 border rounded bg-gray-50">
            <p>Selected mineral: {minerals[0].name}</p>
          </div>
        ) : (
          <div className="mb-4">
            <label className="block mb-2 font-medium">Select Mineral:</label>
            <select 
              value={selectedMineralAddress} 
              onChange={handleSelectChange}
              className="w-full p-3 border rounded"
            >
              <option value="" disabled>-- Select a mineral --</option>
              {minerals.map(mineral => (
                <option key={mineral.address} value={mineral.address}>
                  {mineral.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Quantity */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Quantity:</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="flex-1 p-3 border rounded"
              min="0.01"
              step="0.01"
              placeholder="Enter quantity"
            />
            <select
              value={quantityUnit}
              onChange={(e) => setQuantityUnit(e.target.value)}
              className="w-32 p-3 border rounded"
            >
              <option value="kg">kg</option>
              <option value="t">Metric Ton</option>
              <option value="short t">Short Ton</option>
              <option value="long t">Long Ton</option>
            </select>
          </div>
        </div>
        
        {/* CO2 */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">CO2 Emissions:</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={co2}
              onChange={(e) => setCo2(e.target.value)}
              className="flex-1 p-3 border rounded"
              min="0"
              step="0.01"
              placeholder="Enter CO2 emissions"
            />
            <select
              value={co2Unit}
              onChange={(e) => setCo2Unit(e.target.value)}
              className="w-32 p-3 border rounded"
            >
              <option value="kg">kg</option>
              <option value="t">Metric Ton</option>
              <option value="short t">Short Ton</option>
              <option value="long t">Long Ton</option>
            </select>
          </div>
        </div>
        
        {/* Submit button */}
        <div className="text-right">
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`px-6 py-2 rounded ${
              isFormValid 
                ? isLoading 
                  ? 'bg-green-300' 
                  : 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-300 text-gray-500'
            }`}
          >
            {isLoading ? 'Processing...' : 'Mint Commodity'}
          </button>
        </div>
      </form>
      
      {/* Status message */}
      {formState.message && (
        <div className={`mt-4 p-4 border rounded ${
          formState.success ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'
        }`}>
          {formState.message}
        </div>
      )}
    </section>
  );
}
