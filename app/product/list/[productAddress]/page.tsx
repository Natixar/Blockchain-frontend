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

import { useState, useEffect } from 'react';
import crypto from 'crypto';
import FileUpload from '@/app/components/FileUpload';
import { Mine_1 } from '@/app/blockchain/src/setupAccounts';
import { Account } from '@/app/blockchain/src/Interface/Account';
import { Product } from '../../Tproduct';
import Link from 'next/link';

async function fetchProductDetails(productAddress: string): Promise<Product> {
  const response = await fetch(`/product/list/${productAddress}/details?accountAddress=${Mine_1.address}`);
  if (!response.ok) {
    throw new Error('Failed to fetch product details');
  }
  return await response.json();
}

async function addDocumentsToProduct(mineralAddress: string, documentHashes: string[], account: Account) {
  const response = await fetch('/blockchain/api/document', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mineralAddress, documentHashes, account }),
  });
  if (!response.ok) {
    throw new Error('Failed to add documents');
  }
}

async function removeDocumentFromProduct(mineralAddress: string, documentHash: string, account: Account) {
  const response = await fetch('/blockchain/api/document', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mineralAddress, documentHash, account }),
  });
  if (!response.ok) {
    throw new Error('Failed to remove document');
  }
}

function calculateHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as ArrayBuffer;
      const hash = crypto.createHash('sha256').update(new Uint8Array(data)).digest('hex');
      resolve(hash);
    };
    reader.onerror = () => reject('Error reading file');
    reader.readAsArrayBuffer(file);
  });
}

export default function ProductDetailPage({ params }: { params: { productAddress: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newDocuments, setNewDocuments] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productData = await fetchProductDetails(params.productAddress);
        setProduct(productData);
      } catch (err) {
        setError('Failed to fetch product details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [params.productAddress]);

  const handleDocumentUpload = async (files: File[]) => {
    if (files.length === 0 || !product) return;

    setIsUploading(true);
    setError(null);

    try {
      const hashes = await Promise.all(files.map(file => calculateHash(file)));
      await addDocumentsToProduct(product.address, hashes, Mine_1);
      const updatedProduct = await fetchProductDetails(params.productAddress);
      setProduct(updatedProduct);
      setNewDocuments([]);
    } catch {
      setError('Failed to upload documents.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentDelete = async (hash: string) => {
    if (!product) return;

    try {
      await removeDocumentFromProduct(product.address, hash, Mine_1);
      const updatedProduct = await fetchProductDetails(params.productAddress);
      setProduct(updatedProduct);
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
