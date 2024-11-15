import React, { useState } from 'react';
import { X, Loader2, Wallet, Plus, ArrowUpRight } from 'lucide-react';
import QRCode from '../assets/upi-qr.png';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onAddFunds: (amount: number) => Promise<void>;
}

export function WalletModal({ isOpen, onClose, balance }: WalletModalProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  const handleAddFunds = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      setShowQR(true);
    } catch (err) {
      setError('Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Wallet className="w-8 h-8 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your Wallet
          </h2>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Current Balance</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{balance.toFixed(2)}</p>
        </div>

        {!showQR ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Add Funds
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter amount"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {[100, 200, 500, 1000].map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount.toString())}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  ₹{quickAmount}
                </button>
              ))}
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            <button
              onClick={handleAddFunds}
              disabled={isLoading}
              className="w-full py-3 px-6 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Request Funds
                </>
              )}
            </button>
          </>
        ) : (
          <div className="text-center">
            <img src={QRCode} alt="UPI QR Code" className="mx-auto mb-4 w-48 h-48" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Scan QR code to pay ₹{amount}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Admin will approve your payment shortly after confirmation.
            </p>
            <button
              onClick={() => {
                setShowQR(false);
                setAmount('');
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowUpRight className="w-4 h-4" />
              Make another payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}