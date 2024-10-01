import React, { useState } from 'react';

interface Step2LoadCarriedProps {
  loadCarried: number;
  setLoadCarried: (value: number) => void;
}

// Define the valid units as the keys of unitConversionToKg
type UnitType = keyof typeof unitConversionToKg;

const unitConversionToKg = {
  kg: 1,
  t: 1000,          // Metric ton (t) to kg
  'short t': 907.185, // Short ton to kg
  'long t': 1016.05  // Long ton to kg
};

export default function Step2LoadCarried({ loadCarried, setLoadCarried }: Step2LoadCarriedProps) {
  const [unit, setUnit] = useState<UnitType>('t'); // Restrict unit to the keys of unitConversionToKg
  const [displayedQuantity, setDisplayedQuantity] = useState(loadCarried);

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value as UnitType; // Explicitly cast to UnitType
    const newQuantityKg = displayedQuantity * unitConversionToKg[unit];
    setDisplayedQuantity(newQuantityKg / unitConversionToKg[newUnit]);
    setUnit(newUnit);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputQuantity = parseFloat(e.target.value);
    if (!isNaN(inputQuantity)) {
      setDisplayedQuantity(inputQuantity);
      setLoadCarried(inputQuantity * unitConversionToKg[unit]); // Convert to kg internally
    } else {
      setDisplayedQuantity(0);
    }
  };

  return (
    <div className="flex space-x-2 items-center mt-6">
      <div className="relative flex-grow">
        <input
          type="number"
          id="load-carried"
          value={displayedQuantity}
          onChange={handleQuantityChange}
          className="block w-full px-4 pt-6 pb-2 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 peer placeholder-transparent"
          placeholder="Load Carried"
          aria-label="Load Carried"
        />
        <label
          htmlFor="load-carried"
          className="absolute left-4 top-0.5 px-1 bg-white text-gray-600 text-base transition-all transform -translate-y-3 scale-75 origin-top-left peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-0.5 peer-focus:scale-75 peer-focus:text-blue-500"
        >
          Load Carried ({unit})
        </label>
      </div>
      <div className="relative w-1/4">
        <select
          id="unit"
          value={unit}
          onChange={handleUnitChange}
          className="block w-full px-4 pt-6 pb-2 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 peer placeholder-transparent bg-white"
          aria-label="Unit"
        >
          <option value="kg">kg</option>
          <option value="t">Metric ton</option>
          <option value="short t">Short ton</option>
          <option value="long t">Long ton</option>
        </select>
        <label
          htmlFor="unit"
          className="absolute left-4 top-0.5 px-1 bg-white text-gray-600 text-base transition-all transform -translate-y-3 scale-75 origin-top-left peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-0.5 peer-focus:scale-75 peer-focus:text-blue-500"
        >
          Unit
        </label>
      </div>
    </div>
  );
};
