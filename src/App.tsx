import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { TournamentCard } from './components/TournamentCard';
import { AuthModal } from './components/AuthModal';
import { RegistrationModal } from './components/RegistrationModal';
import { WalletModal } from './components/WalletModal';
import { registerForTournament, getRegistrations, getTournamentPlayerCount } from './services/firebase/db';
import { logoutUser, subscribeToUserData } from './services/firebase/auth';
import { tournaments } from './data/tournaments';
import type { Tournament, UserData } from './types';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [registeredTournaments, setRegisteredTournaments] = useState<number[]>([]);
  const [playerCounts, setPlayerCounts] = useState<Record<number, number>>({});
  const [error, setError] = useState<string>('');

  const loadUserRegistrations = useCallback(async () => {
    if (userData?.uid) {
      try {
        const registrations = await getRegistrations(userData.uid);
        setRegisteredTournaments(registrations);
      } catch (err) {
        console.error('Failed to load registrations:', err);
        setError('Failed to load your registrations');
      }
    }
  }, [userData?.uid]);

  const loadPlayerCounts = useCallback(async () => {
    try {
      const counts = await Promise.all(
        tournaments.map(async (tournament) => ({
          id: tournament.id,
          count: await getTournamentPlayerCount(tournament.id)
        }))
      );
      
      setPlayerCounts(
        counts.reduce((acc, { id, count }) => ({ ...acc, [id]: count }), {})
      );
    } catch (err) {
      console.error('Failed to load player counts:', err);
      setError('Failed to load player counts');
    }
  }, []);

  useEffect(() => {
    const storedAuth = localStorage.getItem('userAuth');
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        setUserData(parsedAuth);
        
        const unsubscribe = subscribeToUserData(parsedAuth.uid, (updatedData) => {
          setUserData(updatedData);
          localStorage.setItem('userAuth', JSON.stringify(updatedData));
        });

        return () => unsubscribe();
      } catch (err) {
        console.error('Failed to parse stored auth:', err);
        localStorage.removeItem('userAuth');
      }
    }
  }, []);

  useEffect(() => {
    if (userData?.uid) {
      loadUserRegistrations();
    }
  }, [userData?.uid, loadUserRegistrations]);

  useEffect(() => {
    loadPlayerCounts();
    const interval = setInterval(loadPlayerCounts, 30000);
    return () => clearInterval(interval);
  }, [loadPlayerCounts]);

  const handleRegistration = async (data: any) => {
    if (!userData) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!selectedTournament) {
      setError('No tournament selected');
      return;
    }

    try {
      if (userData.wallet < selectedTournament.entryFee) {
        setIsRegistrationModalOpen(false);
        setIsWalletModalOpen(true);
        return;
      }

      await registerForTournament({
        ...data,
        uid: userData.uid,
        tournamentId: selectedTournament.id,
        gameName: selectedTournament.game
      }, selectedTournament);

      await loadUserRegistrations();
      await loadPlayerCounts();
      setIsRegistrationModalOpen(false);
      setSelectedTournament(null);
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Failed to register for tournament');
      if (err.message === 'Insufficient wallet balance') {
        setIsRegistrationModalOpen(false);
        setIsWalletModalOpen(true);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('userAuth');
      setUserData(null);
      setRegisteredTournaments([]);
    } catch (err) {
      console.error('Logout failed:', err);
      setError('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 bg-fixed">
      <div className="min-h-screen bg-white/10 backdrop-blur-sm">
        <Header
          userData={userData}
          onWalletClick={() => setIsWalletModalOpen(true)}
          onAuthClick={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
        />

        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                playerCount={playerCounts[tournament.id] || 0}
                isRegistered={registeredTournaments.includes(tournament.id)}
                onJoin={() => {
                  if (!userData) {
                    setIsAuthModalOpen(true);
                  } else {
                    setSelectedTournament(tournament);
                    setIsRegistrationModalOpen(true);
                  }
                }}
              />
            ))}
          </div>
        </main>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(data) => {
            setUserData(data);
            setIsAuthModalOpen(false);
            localStorage.setItem('userAuth', JSON.stringify(data));
          }}
        />

        <WalletModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          balance={userData?.wallet || 0}
          onAddFunds={async () => {}}
        />

        {selectedTournament && (
          <RegistrationModal
            isOpen={isRegistrationModalOpen}
            onClose={() => {
              setIsRegistrationModalOpen(false);
              setSelectedTournament(null);
            }}
            onSubmit={handleRegistration}
            tournamentId={selectedTournament.id}
            gameName={selectedTournament.game}
          />
        )}
      </div>
    </div>
  );
}

export default App;