import { 
  setDoc, 
  getDoc, 
  doc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  FirestoreError
} from 'firebase/firestore';
import { db } from './config';

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: any[];
  }
}

export const handleFirestoreError = (error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null, authUser: any): never => {
  if (error.code === 'permission-denied') {
    const info: FirestoreErrorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: {
        userId: authUser?.uid || 'unauthenticated',
        email: authUser?.email || '',
        emailVerified: authUser?.emailVerified || false,
        isAnonymous: authUser?.isAnonymous || false,
        providerInfo: authUser?.providerData || []
      }
    };
    throw new Error(JSON.stringify(info));
  }
  throw error;
};

// Generic CRUD helpers could go here
