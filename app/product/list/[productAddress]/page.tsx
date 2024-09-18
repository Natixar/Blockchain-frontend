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

  if (isLoading) return <p className="text-gray-500 text-center">Loading product details...</p>;

  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="container mx-auto max-w-3xl">
      <h1 className="text-3xl font-light text-center mb-8 underline decoration-green-500">Product Details</h1>
      {product && (
        <>
          <section className="mb-8">
            <p className="mt-2 text-lg">
              <span className="font-bold">Name:</span> {product.name} ({product.symbol})
            </p>
            <p className="text-lg">
              <span className="font-bold">Quantity:</span> {product.quantity} Kg
            </p>
            <p className="text-lg">
              <span className="font-bold">CO2 Emission:</span> {product.co2} Kg
            </p>
            <p className="text-lg">
              <span className="font-bold">Average Price:</span> {product.price} $
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold">Attached Documents</h2>
            <ul className="mt-4 space-y-3">
              {product.files?.map(hash => (
                <li key={hash} className="flex items-center justify-between">
                  {/* <Link href={`/path/to/download/${hash}`} className="text-blue-600 hover:underline break-all">
                    {hash}
                  </Link> */}
                  <button
                    onClick={() => handleDocumentDelete(hash)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    aria-label={`Delete document ${hash}`}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Add New Documents</h2>
            <FileUpload onFileUpload={handleDocumentUpload} />
            {isUploading && <p className="text-gray-500 mt-2">Uploading documents...</p>}
          </section>
        </>
      )}
    </div>
  );
}
