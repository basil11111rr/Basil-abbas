import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useResume } from '../context/ResumeContext';
import Sidebar from '../components/layout/Sidebar';
import { 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  Download,
  Info,
  Target,
  ExternalLink
} from 'lucide-react';
import { generateTailoredResume } from '../gemini/generateResume';
import { generateCoverLetter } from '../gemini/generateCoverLetter';
import { answerApplicationQuestions } from '../gemini/answerQuestions';
import { generateInterviewPrep } from '../gemini/interviewPrep';
import { downloadResumePDF } from '../utils/pdfGenerator';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

export default function JobDetail() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const { resumeData } = useResume();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isPrepping, setIsPrepping] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!user || !jobId) return;
      try {
        const docRef = doc(db, 'users', user.uid, 'jobs', jobId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setJob({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast.error("Job not found");
          navigate('/dashboard');
        }
      } catch (error) {
        toast.error("Error fetching job details");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [user, jobId, navigate]);

  const handleGenerateResume = async () => {
    if (!resumeData || !job) return;
    setIsGeneratingResume(true);
    try {
      const result = await generateTailoredResume(resumeData, job.jobData);
      const jobRef = doc(db, 'users', user!.uid, 'jobs', job.id);
      await updateDoc(jobRef, {
        generatedResume: result.resumeSections,
        generatedResumeFilename: result.filename,
        updatedAt: serverTimestamp()
      });
      setJob({ ...job, generatedResume: result.resumeSections, generatedResumeFilename: result.filename });
      toast.success("ATS Resume Generated!");
    } catch (error) {
      toast.error("Failed to generate resume");
    } finally {
      setIsGeneratingResume(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!resumeData || !job) return;
    setIsGeneratingCoverLetter(true);
    try {
      const text = await generateCoverLetter(resumeData, job.jobData);
      const jobRef = doc(db, 'users', user!.uid, 'jobs', job.id);
      await updateDoc(jobRef, {
        coverLetter: text,
        updatedAt: serverTimestamp()
      });
      setJob({ ...job, coverLetter: text });
      toast.success("Cover Letter Generated!");
    } catch (error) {
      toast.error("Failed to generate cover letter");
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const handleAnswerQuestions = async () => {
    if (!resumeData || !job || !job.jobData.applicationQuestions?.length) return;
    setIsAnswering(true);
    try {
      const result = await answerApplicationQuestions(job.jobData.applicationQuestions, resumeData, job.jobData);
      const jobRef = doc(db, 'users', user!.uid, 'jobs', job.id);
      await updateDoc(jobRef, {
        applicationQA: result,
        updatedAt: serverTimestamp()
      });
      setJob({ ...job, applicationQA: result });
      toast.success("Questions Answered!");
    } catch (error) {
      toast.error("Failed to answer questions");
    } finally {
      setIsAnswering(false);
    }
  };

  const handleInterviewPrep = async () => {
    if (!resumeData || !job) return;
    setIsPrepping(true);
    try {
      const result = await generateInterviewPrep(resumeData, job.jobData);
      const jobRef = doc(db, 'users', user!.uid, 'jobs', job.id);
      await updateDoc(jobRef, {
        interviewQuestions: result.questions,
        updatedAt: serverTimestamp()
      });
      setJob({ ...job, interviewQuestions: result.questions });
      toast.success("Interview Prep Ready!");
    } catch (error) {
      toast.error("Failed to generate interview prep");
    } finally {
      setIsPrepping(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!user || !job) return;
    try {
      const jobRef = doc(db, 'users', user.uid, 'jobs', job.id);
      await updateDoc(jobRef, { status: newStatus, updatedAt: serverTimestamp() });
      setJob({ ...job, status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#08090d]">
      <Sidebar /><div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#08090d]">
      <Sidebar />
      <main className="flex-1 p-10 max-w-7xl mx-auto w-full">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-8 font-bold text-sm uppercase tracking-wider"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-4xl font-black font-display mb-3">{job.jobData.jobTitle}</h1>
                  <p className="text-xl text-primary font-bold">{job.jobData.company}</p>
                  <p className="text-gray-500 mt-2 flex items-center gap-2 italic">{job.jobData.location} • {job.jobData.jobType}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <select 
                    value={job.status} 
                    onChange={(e) => updateStatus(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2 font-bold text-sm cursor-pointer"
                  >
                    {['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                {job.jobData.requiredKeywords?.slice(0, 5).map((k: string, i: number) => (
                  <span key={`job-detail-req-k-${k.slice(0, 5)}-${i}`} className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-bold text-gray-400 border border-gray-100 dark:border-gray-700">
                    #{k}
                  </span>
                ))}
              </div>

              <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
                <h3 className="text-black dark:text-white font-display mb-4">Job Description</h3>
                <p className="whitespace-pre-wrap leading-relaxed">{job.jobData.jobDescription}</p>
              </div>
            </section>

            {/* AI Assets Section */}
            <section className="space-y-6">
              <AnimatePresence>
                {/* Tailored Resume */}
                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold font-display flex items-center gap-3">
                      <FileText className="text-primary" /> ATS Optimized Resume
                    </h2>
                    {!job.generatedResume ? (
                      <button 
                        onClick={handleGenerateResume}
                        disabled={isGeneratingResume}
                        className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50"
                      >
                        {isGeneratingResume ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />} 
                        {isGeneratingResume ? 'Generating...' : 'Generate with AI'}
                      </button>
                    ) : (
                      <button 
                        onClick={() => downloadResumePDF(job.generatedResume, job.generatedResumeFilename)}
                        className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                      >
                        <Download size={20} /> Download PDF
                      </button>
                    )}
                  </div>
                  
                  {job.generatedResume ? (
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium mb-4 text-gray-500">AI Optimization Note:</p>
                      <p className="text-sm italic text-gray-400">{job.matchDetails.recommendation}</p>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      <FileText size={48} className="mx-auto mb-4 opacity-10" />
                      <p>Generate a version of your resume perfectly tailored for this job.</p>
                    </div>
                  )}
                </div>

                {/* Cover Letter */}
                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold font-display flex items-center gap-3">
                      <Send className="text-accent" /> Personalized Cover Letter
                    </h2>
                    {!job.coverLetter ? (
                      <button 
                        onClick={handleGenerateCoverLetter}
                        disabled={isGeneratingCoverLetter}
                        className="bg-accent text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50"
                      >
                        {isGeneratingCoverLetter ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />} 
                        {isGeneratingCoverLetter ? 'Generating...' : 'Write with AI'}
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          const blob = new Blob([job.coverLetter], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `Cover_Letter_${job.jobData.company}.txt`;
                          a.click();
                        }}
                        className="bg-accent text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                      >
                        <Download size={20} /> Download Text
                      </button>
                    )}
                  </div>

                  {job.coverLetter ? (
                    <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 mt-4 max-h-64 overflow-y-auto custom-scrollbar">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600 dark:text-gray-300 font-sans">{job.coverLetter}</p>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      <Send size={48} className="mx-auto mb-4 opacity-10" />
                      <p>Need a cover letter that sounds like a human wrote it? Our AI can help.</p>
                    </div>
                  )}
                </div>

                {/* Application Questions */}
                {job.jobData.applicationQuestions?.length > 0 && (
                  <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-bold font-display flex items-center gap-3">
                        <Info className="text-amber-500" /> Application Questions
                      </h2>
                      {!job.applicationQA ? (
                        <button 
                          onClick={handleAnswerQuestions}
                          disabled={isAnswering}
                          className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50"
                        >
                          {isAnswering ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />} 
                          {isAnswering ? 'Answering...' : 'Answer with AI'}
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-950/20 px-3 py-1 rounded-full uppercase tracking-wider">Answered</span>
                      )}
                    </div>
                    
                    <div className="space-y-6">
                      {(job.applicationQA || job.jobData.applicationQuestions).map((item: any, i: number) => (
                        <div key={`qa-section-${i}`} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
                          <p className="font-bold text-sm mb-3">Q: {item.question || item}</p>
                          {item.answer ? (
                            <div className="space-y-3">
                              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">" {item.answer} "</p>
                              <div className="flex items-start gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <Sparkles className="text-amber-400 shrink-0" size={12} />
                                <p className="text-[10px] text-gray-400 font-medium leading-normal">{item.answerTips}</p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400">Click 'Answer with AI' to get a natural response based on your background.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interview Prep */}
                <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold font-display flex items-center gap-3">
                      <Target className="text-purple-500" /> Interview Prep
                    </h2>
                    {!job.interviewQuestions ? (
                      <button 
                        onClick={handleInterviewPrep}
                        disabled={isPrepping}
                        className="bg-purple-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50"
                      >
                        {isPrepping ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />} 
                        {isPrepping ? 'Preparing...' : 'Generate Prep Guide'}
                      </button>
                    ) : (
                      <button 
                         onClick={handleInterviewPrep}
                         className="text-xs font-bold text-gray-400 hover:text-primary transition-colors"
                      >
                        Refresh Guide
                      </button>
                    )}
                  </div>

                  {job.interviewQuestions ? (
                    <div className="space-y-4">
                      {job.interviewQuestions.map((q: any, i: number) => (
                        <div key={`prep-interview-${i}`} className="group overflow-hidden rounded-3xl border border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
                          <details className="w-full">
                            <summary className="p-6 cursor-pointer list-none flex justify-between items-center bg-white dark:bg-gray-900 group-open:bg-gray-50 dark:group-open:bg-gray-800/50">
                              <div className="flex items-center gap-4">
                                <span className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/30 text-purple-600 flex items-center justify-center text-xs font-black">{i+1}</span>
                                <p className="font-bold text-sm">{q.question}</p>
                              </div>
                              <ArrowLeft className="rotate-[-90deg] group-open:rotate-[90deg] transition-transform text-gray-300" size={18} />
                            </summary>
                            <div className="p-8 space-y-6">
                              <div>
                                <h4 className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Why they ask</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{q.whyTheyAsk}"</p>
                              </div>
                              <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="text-[10px] font-black uppercase text-green-600 mb-2 tracking-widest">Answer Framework</h4>
                                  <p className="text-xs leading-relaxed">{q.idealAnswerFramework}</p>
                                </div>
                                <div>
                                  <h4 className="text-[10px] font-black uppercase text-red-400 mb-2 tracking-widest">Common Pitfalls</h4>
                                  <p className="text-xs leading-relaxed">{q.doNot}</p>
                                </div>
                              </div>
                            </div>
                          </details>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      <Target size={48} className="mx-auto mb-4 opacity-10" />
                      <p>Get a custom-built interview guide for this specific company and role.</p>
                    </div>
                  )}
                </div>
              </AnimatePresence>
            </section>
          </div>

          {/* Sidebar / Match Details */}
          <div className="space-y-8">
            <section className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-8">AI Match Analysis</h3>
              <div className="relative inline-flex items-center justify-center mb-6">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100 dark:text-gray-800" />
                  <circle 
                    cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" 
                    strokeDasharray={364} 
                    strokeDashoffset={364 - (364 * job.matchScore) / 100} 
                    strokeLinecap="round" 
                    className={`${job.matchScore >= 80 ? 'text-green-500' : job.matchScore >= 50 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000`} 
                  />
                </svg>
                <span className="absolute text-4xl font-black">{job.matchScore || 0}%</span>
              </div>
              <p className={`text-sm font-bold uppercase tracking-widest ${job.matchScore >= 80 ? 'text-green-500' : job.matchScore >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                {job.matchDetails.matchLevel} Match
              </p>
            </section>

            <section className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Resume Insights</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-green-600 uppercase mb-3 flex items-center gap-2"><CheckCircle2 size={12}/> Matched Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {job.matchDetails.matchedKeywords?.map((k: string, i: number) => (
                      <span key={`matched-skill-tag-${k.slice(0, 3)}-${i}`} className="px-3 py-1 bg-green-50 dark:bg-green-950/20 text-green-600 rounded-lg text-[10px] font-bold">{k}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-500 uppercase mb-3 flex items-center gap-2"><AlertTriangle size={12}/> Missing from Resume</p>
                  <div className="flex flex-wrap gap-2">
                    {job.matchDetails.missingKeywords?.map((k: string, i: number) => (
                      <span key={`missing-skill-tag-${k.slice(0, 3)}-${i}`} className="px-3 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-lg text-[10px] font-bold">{k}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {job.jobData.redFlags?.length > 0 && (
              <section className="bg-red-50 dark:bg-red-950/20 rounded-[2.5rem] p-8 border border-red-100 dark:border-red-900/30">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 mb-6 flex items-center gap-2">
                  <AlertTriangle size={14} /> Potential Concerns
                </h3>
                <ul className="space-y-4">
                  {job.jobData.redFlags.map((flag: string, i: number) => (
                    <li key={`job-red-flag-${i}`} className="text-xs text-red-700 dark:text-red-400 flex gap-2">
                      <span className="mt-1">•</span> {flag}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
