'use client';

import { useEffect, useRef, useState } from 'react';
import Step3DocumentUpload from './Step3DocumentUpload';
import Step1TransportData from './Step1TransportData';
import Step2LoadCarried from './Step2LoadCarried';

export default function TransportForm({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const transactionAddress = searchParams.transactionAddress as string | undefined;
    const email = searchParams.email as string | undefined;

    const [step, setStep] = useState(1);
    const [loadCarried, setLoadCarried] = useState<number>(0); // State for load carried
    const [files, setFiles] = useState<File[]>([]);
    const [segments, setSegments] = useState([]);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [data, setData] = useState({ transportEmissions: null, qrCodeSvg: '' });

    const svgRef = useRef<HTMLDivElement>(null); // Reference for the SVG container

    const handleNext = () => setStep((prev) => prev + 1);
    const handlePrevious = () => setStep((prev) => prev - 1);

    const handleDataChange = (data: any) => setSegments(data);
    const handleFileUpload = (files: File[]) => setFiles(files);

    useEffect(() => {
        if (data.qrCodeSvg && svgRef.current) {
            svgRef.current.innerHTML = '';
            svgRef.current.innerHTML = data.qrCodeSvg;
        }
    }, [data.qrCodeSvg]);

    const handleSubmit = async () => {
        if (loadCarried <= 0) {
            setError('Please enter a valid load carried value.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const emissionsResponse = await fetch('/transport/calculate-emissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ segments, loadCarried, transactionAddress, email }),
            });

            if (!emissionsResponse.ok) {
                throw new Error('Failed to calculate emissions');
            }

            const data = await emissionsResponse.json();
            setData(data);

        } catch (error: any) {
            setError(error.message || 'Failed to save transport data');
            console.error('Error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCO2 = (co2Value: number) => {
        if (co2Value > 1000) {
            return `${(co2Value / 1000).toFixed(2)} tonnes`;
        }
        return `${co2Value.toFixed(2)} kg`;
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <Step1TransportData onChange={handleDataChange} />;
            case 2:
                // Use the Step2LoadCarried component
                return <Step2LoadCarried loadCarried={loadCarried} setLoadCarried={setLoadCarried} />;
            case 3:
                return <Step3DocumentUpload onUpload={handleFileUpload} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center">
            <div className="flex flex-col w-full max-w-3xl">
                {renderStep()}
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                <div className="mt-4 flex w-full justify-between">
                    {step > 1 && (
                        <button
                            type="button"
                            className="px-4 py-2 text-lg text-white bg-gray-500 rounded-md hover:bg-gray-600"
                            onClick={handlePrevious}
                            aria-label="Previous Step"
                            disabled={isSubmitting}
                        >
                            Previous
                        </button>
                    )}
                    {step < 3 ? (
                        <button
                            type="button"
                            className="px-4 py-2 text-lg text-white bg-blue-500 rounded-md hover:bg-blue-600 ml-auto"
                            onClick={handleNext}
                            aria-label="Next Step"
                            disabled={isSubmitting}
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={`px-4 py-2 text-lg text-white rounded ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 ml-auto'}`}
                            onClick={handleSubmit}
                            aria-label="Submit Form"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    )}
                </div>

                {data.transportEmissions && (
                    <div className="mt-6 text-center">
                        <p className="text-lg font-semibold">CO2 Emissions: {formatCO2(data.transportEmissions)}</p>
                        {data.qrCodeSvg && (
                            <div
                                ref={svgRef}
                                className="mt-4 inline-block max-w-xs max-h-xs overflow-hidden"
                                style={{ width: '200px', height: '200px' }}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
