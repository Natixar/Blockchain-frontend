/**
 * This component displays the details of a specific blockchain product, including its name, quantity, CO2 emissions, and price.
 * Users can view attached documents related to the product and upload new documents. The component also allows for the deletion 
 * of existing documents. The uploaded files are hashed using SHA-256 before being added to the blockchain product.
 * 
 * The component manages state for product details, document uploads, error handling, and loading states. 
 * It fetches product data based on the provided product address and interacts with the blockchain to manage documents.
 * @module
 */

'use client';

import { useState, useEffect, use } from 'react';
import FileUpload from '@/app/components/FileUpload';
import { Product } from '../../Tproduct';
import Link from 'next/link';

async function fetchProductDetails(commodityAddress: string): Promise<Product> {
  const response = await fetch(`/product/list/${commodityAddress}/details`);
  if (!response.ok) {
    throw new Error('Failed to fetch product details');
  }
  return await response.json();
}

async function fetchDocuments(commodityAddress: string): Promise<string[]> {
  const response = await fetch(`/product/document?commodityAddress=${commodityAddress}`);
  if (!response.ok) {
    throw new Error('Failed to fetch product documents');
  }
  return await response.json();
}

async function addDocumentsToProduct(commodityAddress: string, documentHashes: string[]) {
  const response = await fetch('/product/document', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ commodityAddress, documentHashes }),
  });
  if (!response.ok) {
    throw new Error('Failed to add documents');
  }
}

async function removeDocumentFromProduct(commodityAddress: string, documentHash: string) {
  const response = await fetch('/product/document', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ commodityAddress, documentHash }),
  });
  if (!response.ok) {
    throw new Error('Failed to remove document');
  }
}

export default function ProductDetailPage(props: { params: Promise<{ commodityAddress: string }> }) {
  const params = use(props.params);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productData = await fetchProductDetails(params.commodityAddress);
        const documentHashes = await fetchDocuments(params.commodityAddress);
        console.log(documentHashes)
        setProduct({ ...productData, files: documentHashes });
      } catch (err) {
        setError('Failed to fetch product details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [params.commodityAddress]);

  const handleDocumentUpload = async (files: File[]) => {
    if (files.length === 0 || !product) return;

    setIsUploading(true);
    setError(null);

    try {
      const filenames = await Promise.all(files.map(file => file.name));
      await addDocumentsToProduct(product.address, filenames);
      const updatedProduct = await fetchProductDetails(params.commodityAddress);
      const updatedDocuments = await fetchDocuments(params.commodityAddress);
      setProduct({ ...updatedProduct, files: updatedDocuments });
    } catch {
      setError('Failed to upload documents.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentDelete = async (hash: string) => {
    if (!product) return;

    try {
      await removeDocumentFromProduct(product.address, hash);
      const updatedProduct = await fetchProductDetails(params.commodityAddress);
      const updatedDocuments = await fetchDocuments(params.commodityAddress);
      setProduct({ ...updatedProduct, files: updatedDocuments });
    } catch {
      setError('Failed to delete document.');
    }
  };

  if (isLoading) return <p className="text-gray-500 text-center">Loading commodity details...</p>;

  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-light text-center mb-8 text-blue-950 underline decoration-green-500">Commodity details</h1>
      
      {product && (
        <>
          {/* Product Characteristics Section */}
          <section className="mb-8 p-6 bg-white border border-gray-200 shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-blue-900">Commodity characteristics</h2>
            <div className="text-lg">
              <p className="mb-2"><span className="font-bold">Commodity:</span> {product.name} ({product.symbol})</p>
              <p className="mb-2"><span className="font-bold">Quantity:</span> {product.quantity} tons</p>
              <p className="mb-2"><span className="font-bold">CO2eq:</span> {product.co2} tons</p>
              <p className="mb-2"><span className="font-bold">Average price:</span> {product.price} $</p>
            </div>
          </section>

          {/* Attached Documents Section */}
          <section className="mb-8 p-6 bg-white border border-gray-200 shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-blue-900">Attached documents</h2>
            <ul className="space-y-3">
              {product.files?.map(hash => (
                <li key={hash} className="flex items-center justify-between border-b pb-2">
                  <span className="text-gray-800 break-all">{hash}</span>
                  <button
                    onClick={() => handleDocumentDelete(hash)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    aria-label={`Delete document ${hash}`}
                  >
                    Delete
                  </button>
                </li>
              ))}
              {!product.files?.length && <p className="text-gray-500">No documents attached.</p>}
            </ul>
          </section>

          {/* Upload New Documents Section */}
          <section className="mb-8 p-6 bg-white border border-gray-200 shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-blue-900">Add new documents</h2>
            <FileUpload onFileUpload={handleDocumentUpload} />
            {isUploading && <p className="text-gray-500 mt-2">Uploading documents...</p>}
          </section>
        </>
      )}
    </div>
  );
}
