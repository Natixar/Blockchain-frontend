'use client';

import { useState, useEffect } from 'react';
import { Mine_1 } from '@/app/blockchain/src/setupAccounts';
import { Product } from '@/app/product/Tproduct';

export default function MintingForm() {
  const [minerals, setMinerals] = useState<Product[]>([]);
  const [selectedMineralAddress, setSelectedMineralAddress] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [unit, setUnit] = useState('kg');
  const [co2, setCo2] = useState<string>('');
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
        const response = await fetch(`/blockchain/api/product/list?accountAddress=${Mine_1.address}`);
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

    if (parseInt(quantity) <= 0 || parseInt(co2) < 0) {
      setFormState({ success: false, message: 'Quantity must be greater than 0 and CO2 must be non-negative.' });
      return;
    }

    setIsLoading(true); // Start loading
    
    let quantityInKg = parseFloat(quantity || '0');
    if (unit === 't') {
      quantityInKg *= 1000;
    } else if (unit === 'short t') {
      quantityInKg *= 907.2;
    } else if (unit === 'long t') {
      quantityInKg *= 1016.047;
    }

    const co2Value = parseFloat(co2 || '0');

    try {
      const selectedMineral = minerals.find((mineral) => mineral.address === selectedMineralAddress);
      if (selectedMineral) {
        const response = await fetch('/mine/minting/mint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productAddress: selectedMineral.address,
            quantity: quantityInKg,
            footprint: co2Value,
            account: Mine_1,
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
      <h1 className="text-3xl font-light text-center mb-8 underline decoration-green-500">Minting Form</h1>

      <form onSubmit={handleSubmit} onInput={handleUserInput} className="space-y-4" noValidate>
        <fieldset aria-label="Minting Form">
          <div className="relative">
            {minerals.length === 1 ? (
              <h2 className="text-2xl font-light text-center">{minerals[0].name}</h2>
            ) : (
              <div className="relative">
                <select
                  id="mineral"
                  value={selectedMineralAddress}
                  onChange={(e) => setSelectedMineralAddress(e.target.value)}
                  className="block w-full px-4 pt-6 pb-2 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 peer placeholder-transparent bg-white"
                  aria-label="Select Mineral"
                >
                  <option value="" disabled>
                    Select a mineral
                  </option>
                  {minerals.map((mineral) => (
                    <option key={mineral.address} value={mineral.address}>
                      {mineral.name}
                    </option>
                  ))}
                </select>
                <label
                  htmlFor="mineral"
                  className="absolute left-4 top-0.5 px-1 bg-white text-gray-600 text-base transition-all transform -translate-y-3 scale-75 origin-top-left peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-0.5 peer-focus:scale-75 peer-focus:text-blue-500"
                >
                  Mineral
                </label>
              </div>
            )}
          </div>

          <div className="flex space-x-2 items-center mt-6">
            <div className="relative flex-grow">
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onBlur={(e) => setQuantity(e.target.value || '')}
                className="block w-full px-4 pt-6 pb-2 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 peer placeholder-transparent"
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
            <div className="relative w-1/4">
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="block w-full px-4 pt-6 pb-2 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 peer placeholder-transparent bg-white"
                aria-label="Unit"
              >
                <option value="kg">kg</option>
                <option value="t">Metric Ton (t)</option>
                <option value="short t">Short Ton (short t)</option>
                <option value="long t">Long Ton (long t)</option>
              </select>
              <label
                htmlFor="unit"
                className="absolute left-4 top-0.5 px-1 bg-white text-gray-600 text-base transition-all transform -translate-y-3 scale-75 origin-top-left peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-0.5 peer-focus:scale-75 peer-focus:text-blue-500"
              >
                Unit
              </label>
            </div>
          </div>

          <div className="relative flex-grow">
            <input
              type="number"
              id="co2"
              value={co2}
              onChange={(e) => setCo2(e.target.value)}
              onBlur={(e) => setCo2(e.target.value || '')}
              className="block w-full mt-6 px-4 pt-6 pb-2 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 peer placeholder-transparent"
              placeholder="Total CO2 Emissions"
              aria-label="Total CO2 Emissions"
              aria-invalid={!isFormValid}
            />
            <label
              htmlFor="co2"
              className="absolute left-4 top-0.5 px-1 bg-white text-gray-600 text-base transition-all transform -translate-y-3 scale-75 origin-top-left peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-0.5 peer-focus:scale-75 peer-focus:text-blue-500"
            >
              Total CO2 Emissions (kg)
            </label>
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
                'Mint Mineral'
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
