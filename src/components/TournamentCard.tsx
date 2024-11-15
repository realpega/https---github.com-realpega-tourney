import React from 'react';
import { Users, Map, Clock, DollarSign, Gamepad2 } from 'lucide-react';
import type { Tournament } from '../types';

interface TournamentCardProps {
  tournament: Tournament;
  playerCount: number;
  isRegistered: boolean;
  onJoin: () => void;
}

export function TournamentCard({ tournament, playerCount, isRegistered, onJoin }: TournamentCardProps) {
  return (
    <div className="bg-white/20 backdrop-blur-md rounded-lg shadow-lg p-6 border border-white/10">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-yellow-400" />
            {tournament.game}
          </h2>
          <p className="text-blue-200 text-sm">Tournament #{tournament.id}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-green-400">₹{tournament.prize}</p>
          <p className="text-blue-200 text-sm">Prize Pool</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-300" />
          <span className="text-sm text-blue-200">
            {playerCount}/{tournament.players} Players
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-300" />
          <span className="text-sm text-blue-200">₹{tournament.entryFee} Entry</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-300" />
          <span className="text-sm text-blue-200">{tournament.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-blue-300" />
          <span className="text-sm text-blue-200">{tournament.map}</span>
        </div>
      </div>

      <button
        onClick={onJoin}
        className={`w-full py-2 px-4 rounded-lg ${
          isRegistered
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-yellow-400 hover:bg-yellow-500 text-blue-900'
        } text-white font-semibold transition-colors`}
      >
        {isRegistered ? 'Registered' : 'Join Tournament'}
      </button>
    </div>
  );
}