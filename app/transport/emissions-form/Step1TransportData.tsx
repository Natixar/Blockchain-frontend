'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically load APILoader, only on the client-side
const APILoader = dynamic(
  () => import('@googlemaps/extended-component-library/react').then(mod => mod.APILoader),
  { ssr: false } // This ensures it is only loaded on the client side
);

// Dynamically load PlacePicker, only on the client-side
const PlacePicker = dynamic(
  () => import('@googlemaps/extended-component-library/react').then(mod => mod.PlacePicker),
  { ssr: false } // This ensures it is only loaded on the client side
);

interface TransportSegment {
  transportType: string;
  energyType: string;
  from: string;
  to: string;
}

interface Step4Props {
  onChange: (data: TransportSegment[]) => void;
}

export default function Step4TransportData({ onChange }: Step4Props) {
  const [segments, setSegments] = useState<TransportSegment[]>([
    { transportType: '', energyType: '', from: '', to: '' }
  ]);

  // Generic handler for place changes (from/to)
  const handlePlaceChange = (index: number, field: 'from' | 'to', e: any) => {
    const newSegments = [...segments];
    newSegments[index][field] = e.target.value?.formattedAddress ?? '';
    setSegments(newSegments);
  };

  // Generic handler for transportType and energyType changes
  const handleSelectChange = (index: number, field: 'transportType' | 'energyType', value: string) => {
    const newSegments = [...segments];
    newSegments[index][field] = value;
    setSegments(newSegments);
  };

  useEffect(() => {
    onChange(segments);
  }, [segments, onChange]);

  const addSegment = () => {
    setSegments([...segments, { transportType: '', energyType: '', from: '', to: '' }]);
  };

  const removeSegment = (index: number) => {
    const newSegments = segments.filter((_, i) => i !== index);
    setSegments(newSegments);
  };

  return (
    <div className="w-full mx-auto mb-6">
      <h1 className="text-3xl font-light text-center mb-8 underline decoration-green-500">
        Specify relevant transport data
      </h1>
      <APILoader apiKey="AIzaSyAqVCBp-Kd5hP4wEvaGbqLOMx5S8ZfbPas" solutionChannel="GMP_GCC_placepicker_v1" />

      {segments.map((segment, index) => (
        <div key={index} className="mt-6 pb-4 md:pb-0">
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 items-center">
            {/* Transport Type */}
            <div className="w-full md:w-1/4">
              <select
                name={`transportType-${index}`}
                id={`transportType-${index}`}
                value={segment.transportType}
                onChange={(e) => handleSelectChange(index, 'transportType', e.target.value)}
                className="block w-full px-4 py-2 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                aria-label="Transport Type"
              >
                <option value="" disabled>
                  Transport Type
                </option>
                <option value="truck">Road Truck</option>
                <option value="train">Freight Train</option>
                <option value="ship">Ship</option>
                <option value="airship">Merchant Aviation</option>
                <option value="barge">Inland Waterways</option>
              </select>
            </div>

            {/* Energy Type */}
            <div className="w-full md:w-1/4">
              <select
                name={`energyType-${index}`}
                id={`energyType-${index}`}
                value={segment.energyType}
                onChange={(e) => handleSelectChange(index, 'energyType', e.target.value)}
                className="block w-full px-4 py-2 text-lg border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                aria-label="Energy Type"
              >
                <option value="" disabled>
                  Energy Type
                </option>
                <option value="diesel">Diesel</option>
                <option value="gasoline">Gasoline</option>
                <option value="electricity">Electricity</option>
                <option value="cng">Compressed Natural Gas (CNG)</option>
                <option value="lng">Liquefied Natural Gas (LNG)</option>
                <option value="hfo">Heavy Fuel Oil (HFO)</option>
                <option value="mdo">Marine Diesel Oil (MDO)</option>
                <option value="jetfuel">Jet Fuel (Aviation Kerosene)</option>
                <option value="biofuel">Biofuel</option>
              </select>
            </div>

            {/* From Location PlacePicker */}
            <div className="w-full md:w-1/4">
              <PlacePicker
                placeholder="Enter from location"
                onPlaceChange={(e) => handlePlaceChange(index, 'from', e)}
                className="w-full py-2"
              />
            </div>

            {/* To Location PlacePicker */}
            <div className="w-full md:w-1/4">
              <PlacePicker
                placeholder="Enter to location"
                onPlaceChange={(e) => handlePlaceChange(index, 'to', e)}
                style={{ height: '55px' }}
                className="w-full py-2"
              />
            </div>

            {/* Remove Segment Button */}
            <div className="flex justify-center md:justify-end mt-4 md:mt-0">
              <button
                type="button"
                onClick={() => removeSegment(index)}
                className="text-red-500 hover:text-red-700 text-lg flex items-center"
                aria-label="Remove Segment"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <hr className="mt-4 md:hidden" />
        </div>
      ))}

      {/* Add Segment Button */}
      <div className="mt-6">
        <button
          type="button"
          onClick={addSegment}
          className="px-4 py-2 text-lg bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Transport Segment
        </button>
      </div>
    </div>
  );
}
