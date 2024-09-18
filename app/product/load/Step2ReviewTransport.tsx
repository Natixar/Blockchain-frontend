import { Transaction } from '@/app/transactions/Ttransaction';

interface Step2Props {
  transactionInfo: Transaction;
}

export default function Step2ReviewTransport({ transactionInfo }: Step2Props) {
  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-3xl text-center mb-10 underline decoration-green-500">
        Review Transport Information
      </h1>

      {/* Main content container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">

        {/* Address Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-medium text-blue-900 mb-4 flex items-center space-x-2">
            <span>Transport</span>
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">ID</span>
              <span className="text-gray-900 font-medium">{transactionInfo.address.substring(2, 8).toUpperCase() || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">CO2 Emissions</span>
              <span className="text-gray-900 font-medium">
                {transactionInfo.transportEmissions || 0} Kg
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Date</span>
              <span className="text-gray-900 font-medium">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </section>

        {/* From Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-medium text-blue-900 mb-4 flex items-center space-x-2">
            <span>Addresses</span>
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">From</span>
              <span className="text-gray-900 font-medium">{transactionInfo.from || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">To</span>
              <span className="text-gray-900 font-medium">{transactionInfo.to || 'N/A'}</span>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-medium text-blue-900 mb-4 flex items-center space-x-2">
            <span>Content</span>
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Product Name</span>
              <span className="text-gray-900 font-medium">
                {transactionInfo.product?.name || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Product Symbol</span>
              <span className="text-gray-900 font-medium">
                {transactionInfo.product?.symbol || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Quantity</span>
              <span className="text-gray-900 font-medium">
                {transactionInfo.product?.quantity || 0} Kg
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Price</span>
              <span className="text-gray-900 font-medium">
                ${transactionInfo.product?.price || 0} USD
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Product CO2</span>
              <span className="text-gray-900 font-medium">
                {transactionInfo.product?.co2 || 0} Kg
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
