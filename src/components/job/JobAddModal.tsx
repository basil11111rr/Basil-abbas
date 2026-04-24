import React, { useState } from 'react';
import { X, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { parseJobWithAI } from '../../gemini/parseJob';
import { calculateMatchScore } from '../../gemini/matchScore';
import { useResume } from '../../context/ResumeContext';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

interface JobAddModalProps {
  onClose: () => void;
  onAdded: () => void;
}

export default function JobAddModal({ onClose, onAdded }: JobAddModalProps) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { resumeData } = useResume();
  const { user } = useAuth();

  const handleAddJob = async () => {
    if (!inputText.trim()) return;
    if (!resumeData) {
      toast.error("Please ensure your resume is uploaded first.");
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Parse Job
      const jobData = await parseJobWithAI(inputText);
      
      // 2. Calculate Match Score
      const matchDetails = await calculateMatchScore(resumeData, jobData);
      
      // 3. Save to Firestore
      if (user) {
        const jobsRef = collection(db, 'users', user.uid, 'jobs');
        const newJobRef = doc(jobsRef);
        await setDoc(newJobRef, {
          jobId: newJobRef.id,
          jobData,
          matchScore: matchDetails.matchScore,
          matchDetails,
          status: 'Saved',
          addedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          notes: ''
        });
        toast.success("Job added to your tracker!");
        onAdded();
        onClose();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add job. Please try pasting the raw text instead.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-8 pb-4 flex justify-between items-center border-b border-gray-50 dark:border-gray-800">
          <h2 className="text-2xl font-bold font-display">Add New Job</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          <p className="text-gray-500 mb-6">Paste the job listing URL or the full description text below. Our AI will analyze it for you.</p>
          
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-48 bg-gray-50 dark:bg-gray-800 border-none rounded-3xl p-6 focus:ring-2 focus:ring-primary transition-all resize-none mb-6"
            placeholder="Paste LinkedIn URL or job description text here..."
            disabled={isProcessing}
          />

          <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl mb-8">
            <AlertTriangle className="text-amber-500 shrink-0" size={20} />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              For best results, paste the full text of the job listing. URLs may sometimes be blocked by the source site.
            </p>
          </div>

          <div className="flex justify-end items-center gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-3 font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddJob}
              disabled={isProcessing || !inputText.trim()}
              className="bg-primary text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> AI Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={20} /> Analyze & Add
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
