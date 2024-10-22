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
    const fetchData = async () => {
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
        setFormState({ success: false, message: 'Failed to fetch minerals.' });
        console.error('Failed to fetch minerals:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const valid = selectedMineralAddress !== '' && parseFloat(quantity) > 0 && parseFloat(co2) >= 0;
    setIsFormValid(valid);
  }, [selectedMineralAddress, quantity, co2]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      const firstInvalidElement = document.querySelector('[aria-invalid="true"]') as HTMLElement;
      if (firstInvalidElement) {
        firstInvalidElement.focus();
      }
      setFormState({ success: false, message: 'Please fill out all fields correctly.' });
      return;
    }

    if (parseFloat(quantity) <= 0 || parseFloat(co2) < 0) {
      setFormState({ success: false, message: 'Quantity must be greater than 0 and CO2 must be non-negative.' });
      return;
    }

    setIsLoading(true); // Start loading

    // Convert quantity to kg based on unit
    let quantityInKg = parseFloat(quantity || '0');
    if (quantityUnit === 't') {
      quantityInKg *= 1000;
    } else if (quantityUnit === 'short t') {
      quantityInKg *= 907.2;
    } else if (quantityUnit === 'long t') {
      quantityInKg *= 1016.047;
    }

    // Convert CO2 emissions to kg based on unit
    let co2InKg = parseFloat(co2 || '0');
    if (co2Unit === 't') {
      co2InKg *= 1000;
    } else if (co2Unit === 'short t') {
      co2InKg *= 907.2;
    } else if (co2Unit === 'long t') {
      co2InKg *= 1016.047;
    }

    try {
      const selectedMineral = minerals.find((mineral) => mineral.address === selectedMineralAddress);
      if (selectedMineral) {
        const response = await fetch('/mine/minting/mint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            commodityAddress: selectedMineral.address,
            quantity: quantityInKg, // Quantity in kg for API
            footprint: co2InKg, // CO2 emissions in kg for API
          }),
        });

        if (!response.ok) {
          setFormState({ success: false, message: 'Server Error, please try again later' });
        }

        setFormState({ success: true, message: 'Mineral successfully minted' });

        setProgress(100);
        setTimeout(() => {
          setProgress(0);
        }, 100);
      }
    } catch (error: any) {
      setFormState({ success: false, message: error.message || 'Failed to mint mineral.' });
      console.error('Error:', error);
    } finally {
      setIsLoading(false); // Stop loading

      setTimeout(() => {
        setFormState({ success: null, message: '' });
        setProgress(100);
      }, 5000);
    }
  };

  const handleUserInput = () => {
    setFormState({ success: null, message: '' });
    setProgress(100);
  };

  return (
    <section className="max-w-lg mx-auto">
      <h1 className="text-3xl font-light text-center text-blue-950 mb-8 underline decoration-green-500">Minting commodity</h1>

      <form onSubmit={handleSubmit} onInput={handleUserInput} className="space-y-4" noValidate>
        <fieldset aria-label="Minting Form">
          {minerals.length === 1 ? (
            <h2 className="text-2xl font-light text-center">{minerals[0].name}</h2>
          ) : (
            <select
              id="mineral"
              value={selectedMineralAddress}
              onChange={(e) => setSelectedMineralAddress(e.target.value)}
              className="block w-full px-4 py-4 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 peer placeholder-transparent bg-white"
              aria-label="Select a commodity"
            >
              <option value="" disabled>
                Select a commodity
              </option>
              {minerals.map((mineral) => (
                <option key={mineral.address} value={mineral.address}>
                  {mineral.name}
                </option>
              ))}
            </select>
          )}

          <div className="flex space-x-2 items-center mt-6">
            <div className="relative flex-grow">
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onBlur={(e) => setQuantity(e.target.value || '')}
                className="block w-full px-4 pt-4 pb-2 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 peer placeholder-transparent"
                placeholder="Quantity"
                aria-label="Quantity"
                aria-invalid={!isFormValid}
              />
              <label
                htmlFor="quantity"
                className="absolute left-4 top-0.5 px-1 bg-white text-gray-600 text-base transition-all transform -translate-y-3 scale-75 origin-top-left peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-0.5 peer-focus:scale-75 peer-focus:text-blue-500"
              >
                Quantity
              </label>
            </div>
            <div className="w-1/4">
              <select
                id="quantity-unit"
                value={quantityUnit} // Separate unit for quantity
                onChange={(e) => setQuantityUnit(e.target.value)}
                className="block w-full px-4 py-4 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 peer placeholder-transparent bg-white"
                aria-label="Unit"
              >
                <option value="kg">kg</option>
                <option value="t">Metric Ton</option>
                <option value="short t">Short Ton</option>
                <option value="long t">Long Ton</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-2 items-center mt-6">
            <div className="relative flex-grow">
              <input
                type="number"
                id="co2"
                value={co2}
                onChange={(e) => setCo2(e.target.value)}
                onBlur={(e) => setCo2(e.target.value || '')}
                className="block w-full px-4 pt-4 pb-2 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 peer placeholder-transparent"
                placeholder="Total CO2 Emissions"
                aria-label="Total CO2 Emissions"
                aria-invalid={!isFormValid}
              />
              <label
                htmlFor="co2"
                className="absolute left-4 top-0.5 px-1 bg-white text-gray-600 text-base transition-all transform -translate-y-3 scale-75 origin-top-left peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-0.5 peer-focus:scale-75 peer-focus:text-blue-500"
              >
                Total CO2eq
              </label>
            </div>
            <div className="w-1/4">
              <select
                id="co2-unit"
                value={co2Unit} // Separate unit for CO2
                onChange={(e) => setCo2Unit(e.target.value)}
                className="block w-full px-4 py-4 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 peer placeholder-transparent bg-white"
                aria-label="Unit"
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
              className={`mt-6 px-4 py-2 text-white rounded ${isFormValid
                ? isLoading
                  ? 'bg-green-500 cursor-wait'
                  : 'bg-green-500 hover:bg-green-600'
                : 'bg-gray-400 cursor-not-allowed'
                }`}
              disabled={!isFormValid || isLoading}
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
                'Mint commodity'
              )}
            </button>
          </div>
        </fieldset>
      </form>

      {/* Notification */}
      {formState.message && (
        <div
          id="form-feedback"
          className={`mt-8 p-4 mx-auto max-w-lg ${formState.success
            ? 'text-green-700 bg-green-100 border-green-400'
            : 'text-red-700 bg-red-100 border-red-400'
            } border rounded relative`}
          role="alert"
          aria-live="assertive"
        >
          {formState.message}
          <div
            className="absolute bottom-0 left-0 h-1 bg-green-500 transition-all"
            style={{
              width: `${progress}%`,
              transition: progress === 0 ? 'width 5s linear' : 'none',
            }}
          ></div>
        </div>
      )}
    </section>
  );
}
