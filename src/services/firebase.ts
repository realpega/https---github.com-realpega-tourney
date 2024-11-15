import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, serverTimestamp } from 'firebase/database';
import type { RegistrationData } from '../components/RegistrationModal';

const firebaseConfig = {
  apiKey: "AIzaSyCy0ETSqY4VOrowGKiGJg6o6oNjNGTl1M4",
  authDomain: "tourney-228a2.firebaseapp.com",
  projectId: "tourney-228a2",
  storageBucket: "tourney-228a2.appspot.com",
  messagingSenderId: "431696358196",
  appId: "1:431696358196:web:e57041f4a807b8f7ed5361",
  measurementId: "G-M3KH56B6YV",
  databaseURL: "https://tourney-228a2-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export const registerForTournament = async (data: RegistrationData) => {
  const registrationRef = ref(database, `registrations/${data.tournamentId}/${data.uid}`);
  
  // Check if already registered
  const snapshot = await get(registrationRef);
  if (snapshot.exists()) {
    throw new Error('You are already registered for this tournament');
  }
  
  await set(registrationRef, {
    ...data,
    timestamp: serverTimestamp(),
    status: 'pending' // pending, approved, rejected
  });
  
  return true;
};

export const getRegistrations = async (uid: string) => {
  const registrationsRef = ref(database, 'registrations');
  const snapshot = await get(registrationsRef);
  
  if (!snapshot.exists()) return [];
  
  const registrations: number[] = [];
  snapshot.forEach((tournamentSnap) => {
    if (tournamentSnap.hasChild(uid)) {
      registrations.push(parseInt(tournamentSnap.key as string));
    }
  });
  
  return registrations;
};

export const getTournamentPlayerCount = async (tournamentId: number) => {
  const registrationsRef = ref(database, `registrations/${tournamentId}`);
  const snapshot = await get(registrationsRef);
  
  if (!snapshot.exists()) return 0;
  
  return Object.keys(snapshot.val()).length;
};