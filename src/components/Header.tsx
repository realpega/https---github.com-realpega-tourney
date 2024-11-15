import React from 'react';
import { Trophy, Target, Wallet, LogOut } from 'lucide-react';
import type { UserData } from '../types';

interface HeaderProps {
  userData: UserData | null;
  onWalletClick: () => void;
  onAuthClick: () => void;
  onLogout: () => void;
}

export function Header({ userData, onWalletClick, onAuthClick, onLogout }: HeaderProps) {
  return (
    <header className="bg-white/20 backdrop-blur-md shadow">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-400" />
          Tournament Hub
        </h1>
        <div className="flex items-center gap-6">
          {userData ? (
            <div className="flex items-center gap-4">
              <button
                onClick={onWalletClick}
                className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors"
              >
                <Wallet className="w-5 h-5" />
                ₹{userData.wallet.toFixed(2)}
              </button>
              <div className="flex items-center gap-2 text-white">
                <Target className="w-5 h-5" />
                {userData.points} Points
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors font-semibold"
            >
              Login / Sign Up
            </button>
          )}
        </div>
      </div>
    </header>
  );
}