'use client';

import { use, useEffect, useState } from 'react';

interface HistoryEntry {
  method: string;
  interfaceName: string;
  instanceAddress: string;
  params: string[];
  groupName?: string;
}

export default function Report({ params }: {params: Promise<{ transactionHash: string }>}) {
  const { transactionHash } = use(params);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/transactions/report/${transactionHash}/getHistory`);
        if (!response.ok) {
          throw new Error(`Failed to fetch history: ${response.statusText}`);
        }
        const data: HistoryEntry[] = await response.json();
        setHistory(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching history.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [transactionHash]);

  const formatTons = (value: number): string => (value / 1e18).toFixed(2);
  const formatDollars = (value: number): string => (value / 1e18).toFixed(2);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Blockchain History</h1>
      <ul>
        {history.map((entry, index) => (
          <li key={index}>
            <h2>{entry.method}</h2>
            <p><strong>Interface Name:</strong> {entry.interfaceName}</p>
            <p><strong>Instance Address:</strong> {entry.instanceAddress}</p>
            {entry.method === 'createMineral' && (
              <>
                <p><strong>Commodity Name:</strong> {entry.params[0]}</p>
                <p><strong>Symbol:</strong> {entry.params[1]}</p>
                <p><strong>Average Price:</strong> {formatDollars(Number(entry.params[2]))} $</p>
                <p><strong>Contract Address:</strong> {entry.instanceAddress}</p>
                <p><strong>Created by:</strong> {entry.groupName}</p>
              </>
            )}
            {entry.method === 'mint' && (
              <>
                <p><strong>Minted Quantity:</strong> {formatTons(Number(entry.params[0]))} tons</p>
                <p><strong>CO2 Equivalent:</strong> {formatTons(Number(entry.params[1]))} tons</p>
                <p><strong>Commodity:</strong> {entry.params[2]}</p>
              </>
            )}
            {entry.method === 'createPackageWithoutTransporter' && (
              <>
                <p><strong>From Address:</strong> {entry.params[0]}</p>
                <p><strong>To Address:</strong> {entry.params[1]}</p>
                <p><strong>Commodity Address:</strong> {entry.params[2]}</p>
                <p><strong>Quantity:</strong> {formatTons(Number(entry.params[3]))} tons</p>
              </>
            )}
            {['load', 'unload'].includes(entry.method) && (
              <>
                <p><strong>Transaction Address:</strong> {entry.instanceAddress}</p>
                {entry.method === 'load' && (
                  <p><strong>CO2 Equivalent:</strong> {formatTons(Number(entry.params[0]))} tons</p>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
