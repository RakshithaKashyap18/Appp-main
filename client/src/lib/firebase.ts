import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBLKVIBmM3caXxLq94ztI2Za6UZcsMcFX4",
  authDomain: "documentanalyser-61ab6.firebaseapp.com",
  projectId: "documentanalyser-61ab6",
  storageBucket: "documentanalyser-61ab6.appspot.com",
  appId: "1:559026750020:web:ca38624501299e8ac1b211"
};

// Debug Firebase config
console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? 'Set' : 'Missing',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId ? 'Set' : 'Missing',
  appId: firebaseConfig.appId ? 'Set' : 'Missing'
});

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Request email scope explicitly
googleProvider.addScope('email');
googleProvider.addScope('profile');