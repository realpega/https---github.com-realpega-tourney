import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RegistrationData) => Promise<void>;
  tournamentId: number;
  gameName: string;
}

export interface RegistrationData {
  uid: string;
  email: string;
  utr: string;
  tournamentId: number;
  gameName: string;
}

export function RegistrationModal({ isOpen, onClose, onSubmit, tournamentId, gameName }: RegistrationModalProps) {
  const [formData, setFormData] = useState({
    uid: '',
    email: '',
    utr: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.uid || !formData.email || !formData.utr) {
      setError('All fields are required');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...formData,
        tournamentId,
        gameName
      });
      // Reset form
      setFormData({ uid: '', email: '', utr: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Join Tournament #{tournamentId}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Please enter your details to register for {gameName}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="uid" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Game UID
            </label>
            <input
              type="text"
              id="uid"
              value={formData.uid}
              onChange={(e) => setFormData(prev => ({ ...prev, uid: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter your game UID"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email ID
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter your email"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="utr" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              UTR (Transaction ID)
            </label>
            <input
              type="text"
              id="utr"
              value={formData.utr}
              onChange={(e) => setFormData(prev => ({ ...prev, utr: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter transaction ID"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Registering...
              </>
            ) : (
              'Submit Registration'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}