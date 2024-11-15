import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { getDatabase, ref, set, get, onValue } from 'firebase/database';

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
const auth = getAuth(app);
const db = getDatabase(app);

export interface AuthData {
  email: string;
  password: string;
  name?: string;
  mobile?: string;
}

export const registerUser = async (data: AuthData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const user = userCredential.user;

    if (data.name) {
      await updateProfile(user, { displayName: data.name });
    }

    await set(ref(db, `users/${user.uid}`), {
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      wallet: 0,
      points: 0,
      createdAt: new Date().toISOString()
    });

    return {
      uid: user.uid,
      email: user.email,
      name: data.name,
      wallet: 0,
      points: 0
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('An account with this email already exists');
    }
    throw new Error(error.message);
  }
};

export const loginUser = async (data: AuthData) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
    const user = userCredential.user;

    const userRef = ref(db, `users/${user.uid}`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      throw new Error('User data not found');
    }
    
    const userData = snapshot.val();

    return {
      uid: user.uid,
      email: user.email,
      name: userData.name || user.displayName,
      wallet: userData.wallet || 0,
      points: userData.points || 0
    };
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email');
    }
    if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password');
    }
    if (error.code === 'auth/invalid-credential') {
      throw new Error('Invalid email or password');
    }
    throw new Error('Login failed. Please check your credentials and try again.');
  }
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const subscribeToUserData = (uid: string, callback: (data: any) => void) => {
  const userRef = ref(db, `users/${uid}`);
  return onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const userData = snapshot.val();
      callback({
        uid,
        email: userData.email,
        name: userData.name,
        wallet: userData.wallet || 0,
        points: userData.points || 0
      });
    }
  });
};