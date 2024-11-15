import { getDatabase, ref, set, get, serverTimestamp, runTransaction } from 'firebase/database';
import type { RegistrationData } from '../../components/RegistrationModal';
import type { Tournament } from '../../types';

const db = getDatabase();

export const registerForTournament = async (data: RegistrationData, tournament: Tournament) => {
  try {
    const userRef = ref(db, `users/${data.uid}`);
    const registrationRef = ref(db, `registrations/${data.tournamentId}/${data.uid}`);
    
    // Check if already registered
    const snapshot = await get(registrationRef);
    if (snapshot.exists()) {
      throw new Error('You are already registered for this tournament');
    }

    // Use transaction to safely update wallet balance
    await runTransaction(userRef, (userData) => {
      if (!userData) {
        throw new Error('User data not found');
      }

      const currentBalance = userData.wallet || 0;
      if (currentBalance < tournament.entryFee) {
        throw new Error('Insufficient wallet balance');
      }

      // Deduct entry fee from wallet
      userData.wallet = currentBalance - tournament.entryFee;
      return userData;
    });

    // Register for tournament
    await set(registrationRef, {
      ...data,
      timestamp: serverTimestamp(),
      status: 'pending',
      entryFee: tournament.entryFee
    });

    // Update tournament stats
    const statsRef = ref(db, `tournamentStats/${data.tournamentId}`);
    const statsSnapshot = await get(statsRef);
    const currentStats = statsSnapshot.val() || { playerCount: 0 };
    
    await set(statsRef, {
      ...currentStats,
      playerCount: currentStats.playerCount + 1,
      lastUpdated: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Tournament registration failed:', error);
    throw error;
  }
};

export const getRegistrations = async (uid: string) => {
  try {
    const registrationsRef = ref(db, 'registrations');
    const snapshot = await get(registrationsRef);
    
    if (!snapshot.exists()) return [];
    
    const registrations: number[] = [];
    snapshot.forEach((tournamentSnap) => {
      if (tournamentSnap.hasChild(uid)) {
        registrations.push(parseInt(tournamentSnap.key as string));
      }
    });
    
    return registrations;
  } catch (error) {
    console.error('Failed to get registrations:', error);
    return [];
  }
};

export const getTournamentPlayerCount = async (tournamentId: number) => {
  try {
    const statsRef = ref(db, `tournamentStats/${tournamentId}`);
    const snapshot = await get(statsRef);
    
    if (!snapshot.exists()) return 0;
    
    return snapshot.val().playerCount || 0;
  } catch (error) {
    console.error('Failed to get player count:', error);
    return 0;
  }
};