'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import QRCodeScanner from '@/app/components/QRCodeScanner';
import Step2ReviewTransport from './Step2ReviewTransport';
import Step3DocumentUpload from './Step3DocumentUpload';
import { Transaction } from '@/app/transactions/Ttransaction';
import { Mine_1 } from '@/app/blockchain/src/setupAccounts';

export default function LoadForm() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [transactionInfo, setTransactionInfo] = useState<Transaction>({} as Transaction);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false); // Success state
    const [progress, setProgress] = useState(100); // Progress for success bar

    const handleNext = () => setStep((prev) => prev + 1);
    const handlePrevious = () => setStep((prev) => prev - 1);

    const handleNextStep1 = async (transactionAddress: string, transportEmissions: number) => {
        try {
            setError(null);
            const response = await fetch(`/transactions/get?transactionAddress=${transactionAddress}&accountAddress=${Mine_1.address}`);

            if (!response.ok) {
                throw new Error('Failed to fetch contract data');
            }

            const transaction = await response.json();
            setTransactionInfo({ ...transaction, address: transactionAddress, transportEmissions });
            handleNext();
        } catch (error) {
            setError("Error fetching contract data");
            console.error("Error fetching contract data", error);
        }
    };

    const handleFileUpload = (files: File[]) => {
        setUploadedFiles(files);
    };

    const handleSubmit = async () => {
        setIsLoading(true); // Start loading
        setError(null); // Clear previous error
        try {
            const response = await fetch('/blockchain/api/package/load', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transactionAddress: transactionInfo.address,
                    transportEmissions: transactionInfo.transportEmissions,
                    account: Mine_1, // Assuming the account is Mine_1
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to load package');
            }

            const responseData = await response.json();
            setIsSubmitSuccessful(true); // Show success message
            setProgress(100); // Reset progress bar

            // Progress bar animation
            setTimeout(() => setProgress(0), 100);

            // Redirect or do something after a delay
            setTimeout(() => {
                router.push('/product/list');
            }, 3000); // Wait for 3 seconds before redirecting
        } catch (error) {
            setError("Failed to load package");
            console.error("Failed to load package", error);
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <QRCodeScanner<{ transactionAddress: string; transportEmissions: number }>
                        onScanComplete={({ transactionAddress, transportEmissions }) =>
                            handleNextStep1(transactionAddress, transportEmissions)
                        }
                    />
                );
            case 2:
                return <Step2ReviewTransport transactionInfo={transactionInfo} />;
            case 3:
                return <Step3DocumentUpload onUpload={handleFileUpload} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center">
            <div className="flex flex-col w-full max-w-xl">
                {renderStep()}
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}

                <div className="mt-4 flex w-full justify-between">
                    {step > 1 && step <= 3 && (
                        <button
                            type="button"
                            className="px-4 py-2 text-lg text-white bg-gray-500 rounded-md hover:bg-gray-600"
                            onClick={handlePrevious}
                            aria-label="Previous Step"
                        >
                            Previous
                        </button>
                    )}
                    {step > 1 && step < 3 ? (
                        <button
                            type="button"
                            className="px-4 py-2 text-lg text-white bg-blue-500 rounded-md hover:bg-blue-600 ml-auto"
                            onClick={handleNext}
                            aria-label="Next Step"
                        >
                            Next
                        </button>
                    ) : step === 3 ? (
                        <button
                            type="button"
                            className={`px-4 py-2 text-lg text-white rounded-md ml-auto ${isLoading ? 'bg-green-500 cursor-wait' : 'bg-green-500 hover:bg-green-600'}`}
                            onClick={handleSubmit}
                            aria-label="Submit Form"
                            disabled={isLoading}
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
                                'Submit'
                            )}
                        </button>
                    ) : null}
                </div>

                {isSubmitSuccessful && (
                    <div
                        className="mt-8 p-4 mx-auto max-w-lg text-green-700 bg-green-100 border-green-400 border rounded relative"
                        role="alert"
                    >
                        Package loaded successfully! Redirecting...
                        <div
                            className="absolute bottom-0 left-0 h-1 bg-green-500 transition-all"
                            style={{ width: `${progress}%`, transition: 'width 3s linear' }}
                        ></div>
                    </div>
                )}
            </div>
        </div>
    );
}
