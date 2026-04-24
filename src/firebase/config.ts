import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Use the database ID from the config as required by instructions
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Connectivity check as per instructions
async function testConnection() {
  try {
    // Attempting to read a non-existent doc to trigger a server check
    await getDocFromServer(doc(db, '_connection_test_', 'check'));
    console.log("Firebase connection established.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.error("Firebase client is offline. Check configuration and connectivity.");
    }
  }
}

testConnection();

export default app;
