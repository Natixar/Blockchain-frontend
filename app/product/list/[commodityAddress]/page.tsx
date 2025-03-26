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

interface Transaction {
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  formattedTime: string;
  formattedValue: string;
  txHash: string;
}

interface Group {
  name: string;
  blockchainAddress: string;
}

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

async function fetchTokenTransactions(tokenAddress: string): Promise<Transaction[]> {
  try {
    const response = await fetch(`/product/tnx-in?tokenAddress=${tokenAddress}`);
    if (!response.ok) {
      throw new Error('Failed to fetch token transactions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

async function generateCarbonTrackingPDF(mineralAddress: string, hash: string, groups: Array<any>): Promise<Blob> {
  
  try {
    const response = await fetch('/product/carbonTrackingService', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mineralAddress,
        hash,
        groups
      }),
    });

    if (!response.ok) {
      throw new Error(`Error generating PDF: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw error;
  }
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
  const [groups, setGroups] = useState<Group[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productData = await fetchProductDetails(params.commodityAddress);
        const documentHashes = await fetchDocuments(params.commodityAddress);
        setProduct({ ...productData, files: documentHashes });
        
        // Fetch transactions after we have the product details
        if (productData.address) {
          setIsTransactionsLoading(true);
          const txs = await fetchTokenTransactions(productData.address);
          setTransactions(txs);
          setIsTransactionsLoading(false);
        }
      } catch (err) {
        setError('Failed to fetch product details.');
      } finally {
        setIsLoading(false);
      }
    };
    async function fetchGroups() {
      try {
        const groupResponse = await fetch('/transactions/create/getGroups');
        if (!groupResponse.ok) {
          throw new Error('Failed to fetch groups');
        }
        const data = await groupResponse.json();
        setGroups(data);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    }

    fetchData();
    fetchGroups();
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

  const handleDownloadPDF = async (transaction: any, index: number, groups: Array<any>) => {
    if (!product) return;
    
    try {
      setGeneratingPDF(`${transaction.timeStamp}-${index}`); // Set which transaction is generating PDF
      const pdfBlob = await generateCarbonTrackingPDF(product.address, transaction.hash, groups);
      
      // Create a download link and trigger click
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `carbon-tracking-${product.name}-${transaction.timeStamp}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to generate PDF report.');
    } finally {
      setGeneratingPDF(null);
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

          {/* Last IN Transactions */}
          <section className="mb-8 p-6 bg-white border border-gray-200 shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-blue-900">Last IN Transactions</h2>
            <div className="text-lg">
              {isTransactionsLoading ? (
                <p className="text-gray-500">Loading transactions...</p>
              ) : transactions.length === 0 ? (
                <p className="text-gray-500">No incoming transactions found.</p>
              ) : (
                transactions.map((tx, index) => (
                  <div key={`${tx.timeStamp}-${index}`} className="mb-6 p-4 border border-gray-200 rounded-lg shadow-sm">
                    <div className="mb-3">
                      <p><strong>From:</strong> {groups.find(e => e.blockchainAddress.toLowerCase() === tx.from.toLowerCase()) ?  `${groups.find(e => e.blockchainAddress === tx.from)?.name} (${tx.from})` : tx.from} </p>
                      <p><strong>To:</strong> {groups.find(e => e.blockchainAddress.toLowerCase() === tx.to.toLowerCase()) ?  `${groups.find(e => e.blockchainAddress === tx.to)?.name} (${tx.to})` : tx.to}</p>
                      <p><strong>Quantity:</strong> {tx.formattedValue} tons</p>
                      <p><strong>Timestamp:</strong> {tx.formattedTime}</p>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleDownloadPDF(tx, index, groups)}
                        disabled={generatingPDF === `${tx.timeStamp}-${index}`}
                        className={`flex items-center px-4 py-2 rounded-md text-white 
                          ${generatingPDF === `${tx.timeStamp}-${index}` 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700'} 
                          transition-colors duration-200`}
                      >
                        {generatingPDF === `${tx.timeStamp}-${index}` ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating PDF...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd"></path>
                            </svg>
                            Download Carbon Tracking PDF
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
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
