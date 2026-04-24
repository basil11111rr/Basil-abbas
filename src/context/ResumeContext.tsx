import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

interface ResumeContextType {
  resumeData: any | null;
  setResumeData: (data: any) => void;
  loading: boolean;
  saveResume: (data: any) => Promise<void>;
}

const ResumeContext = createContext<ResumeContextType>({
  resumeData: null,
  setResumeData: () => {},
  loading: true,
  saveResume: async () => {}
});

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResume = async () => {
      if (!user) {
        setResumeData(null);
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'users', user.uid, 'resumeData', 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setResumeData(docSnap.data().structured);
        }
      } catch (error) {
        console.error("Error fetching resume:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [user]);

  const saveResume = async (data: any) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid, 'resumeData', 'main');
      await setDoc(docRef, {
        structured: data,
        uploadedAt: serverTimestamp()
      }, { merge: true });
      setResumeData(data);
    } catch (error) {
      console.error("Error saving resume:", error);
      throw error;
    }
  };

  return (
    <ResumeContext.Provider value={{ resumeData, setResumeData, loading, saveResume }}>
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => useContext(ResumeContext);
