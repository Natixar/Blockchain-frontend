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

export default function DefineProductForm() {
    // List of product categories and their respective products
    const productCategories = {
        'Iron and Ferro-Alloy Metals': [
            { name: 'Iron', symbol: 'Fe' },
            { name: 'Chromium', symbol: 'Cr2O3' },
            { name: 'Cobalt', symbol: 'Co' },
            { name: 'Manganese', symbol: 'Mn' },
            { name: 'Molybdenum', symbol: 'Mo' },
            { name: 'Nickel', symbol: 'Ni' },
            { name: 'Niobium', symbol: 'Nb2O5' },
            { name: 'Tantalum', symbol: 'Ta2O5' },
            { name: 'Titanium', symbol: 'TiO2' },
            { name: 'Tungsten', symbol: 'W' },
            { name: 'Vanadium', symbol: 'V' },
        ],
        'Non-Ferrous Metals': [
            { name: 'Aluminium', symbol: 'Al' },
            { name: 'Antimony', symbol: 'Sb' },
            { name: 'Arsenic', symbol: 'As2O3' },
            { name: 'Bauxite', symbol: 'crude ore' },
            { name: 'Beryllium', symbol: 'concentrate' },
            { name: 'Bismuth', symbol: 'Bi' },
            { name: 'Cadmium', symbol: 'Cd' },
            { name: 'Copper', symbol: 'Cu' },
            { name: 'Gallium', symbol: 'Ga' },
            { name: 'Germanium', symbol: 'Ge' },
            { name: 'Indium', symbol: 'In' },
            { name: 'Lead', symbol: 'Pb' },
            { name: 'Lithium', symbol: 'Li2O' },
            { name: 'Mercury', symbol: 'Hg' },
            { name: 'Rare Earth Minerals', symbol: 'REO' },
            { name: 'Rhenium', symbol: 'Re' },
            { name: 'Selenium', symbol: 'Se' },
            { name: 'Tellurium', symbol: 'Te' },
            { name: 'Tin', symbol: 'Sn' },
            { name: 'Zinc', symbol: 'Zn' },
        ],
        'Precious Metals': [
            { name: 'Gold', symbol: 'Au' },
            { name: 'Palladium', symbol: 'Pd' },
            { name: 'Platinum', symbol: 'Pt' },
            { name: 'Rhodium', symbol: 'Rh' },
            { name: 'Silver', symbol: 'Ag' },
        ],
    };

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
    const [isLoading, setIsLoading] = useState(false); // New loading state

    /**
     * Checks if the form is valid by verifying whether the required fields are filled.
     * 
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    function isFormValid() {
        return isAddingNew
            ? customProductName.trim() !== '' && customSymbol.trim() !== '' && parseFloat(price) > 0
            : selectedProduct !== '';
    };

    /**
     * Handles changes in input fields and updates the state accordingly.
     * 
     * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event.
     * @param {string} event.target.name - The name of the input field.
     * @param {string} event.target.value - The value of the input field.
     */
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        if (name === 'customProductName') setCustomProductName(value);
        else if (name === 'customSymbol') setCustomSymbol(value);
        else if (name === 'price') setPrice(value);
    };

    /**
     * Handles the form submission process. Depending on whether a new product is being added, it sends either 
     * the predefined product or custom product data to the server.
     * 
     * @async
     * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
     * @throws Will throw an error if the form submission fails.
     * @returns {Promise<void>} Resolves when the form is submitted and processed.
     */
    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true); // Start loading

        const formData = new FormData();
        if (isAddingNew) {
            formData.append('name', customProductName);
            formData.append('symbol', customSymbol);
            formData.append('price', price);
            const fileInputs = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInputs && fileInputs.files) {
                for (let i = 0; i < fileInputs.files.length; i++) {
                    formData.append('files', fileInputs.files[i]);
                }
            }
        } else {
            formData.append('selectedProduct', selectedProduct);
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
            setIsLoading(false); // Stop loading
        }
    };

    return (
        <div className="max-w-lg mx-auto">
            <form onSubmit={handleFormSubmit} className="space-y-4" aria-describedby="form-feedback" noValidate>
                <h1 className="text-3xl font-light text-center mb-8 underline decoration-green-500">
                    Declare New Product Type
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
                        <label htmlFor="product-select" className="block text-lg font-medium text-gray-700">
                            Select Product Type
                        </label>
                        <select
                            id="product-select"
                            name="selectedProduct"
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="block w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">Choose a product type...</option>
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
                            Can&apos;t find your product type? Add a new one
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
                                placeholder="Product Name"
                            />
                            <label
                                htmlFor="customProductName"
                                className="absolute left-4 top-0.5 px-1 bg-white text-gray-600 text-base transition-all transform -translate-y-3 scale-75 origin-top-left peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-0.5 peer-focus:scale-75 peer-focus:text-blue-500"
                            >
                                Product Name
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
                                className="absolute left-4 top-0.5 px-1 bg-white text-gray-600 text-base transition-all transform -translate-y-3 scale-75 origin-top-left peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-0.5 peer-focus:scale-75 peer-focus:text-blue-500"
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
                                className="absolute left-4 top-0.5 px-1 bg-white text-gray-600 text-base transition-all transform -translate-y-3 scale-75 origin-top-left peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-focus:top-0.5 peer-focus:scale-75 peer-focus:text-blue-500"
                            >
                                Average Price
                            </label>
                        </div>

                        <FileUpload2 />

                        <label htmlFor="toggleNewProduct" className="mt-2 text-blue-500 hover:underline cursor-pointer">
                            Choose a predefined product instead
                        </label>
                    </div>
                )}

                <div className="text-right">
                    <button
                        type="submit"
                        className={`px-4 py-2 text-white rounded ${isFormValid() ? (isLoading ? 'bg-green-500 cursor-wait' : 'bg-green-500 hover:bg-green-600') : 'bg-gray-400 cursor-not-allowed'}`}
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
                                Submitting...
                            </span>
                        ) : (
                            'Declare Product'
                        )}
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
