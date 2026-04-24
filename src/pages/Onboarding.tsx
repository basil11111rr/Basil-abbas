import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import ResumeUploader from '../components/resume/ResumeUploader';
import { Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Onboarding() {
  const [parsedData, setParsedData] = useState<any | null>(null);
  const { resumeData, saveResume } = useResume();
  const navigate = useNavigate();

  // If already have resume from previous session, just go to dashboard
  React.useEffect(() => {
    if (resumeData && !parsedData) {
      navigate('/dashboard');
    }
  }, [resumeData, parsedData, navigate]);

  const handleConfirm = async () => {
    if (parsedData) {
      await saveResume(parsedData);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1117] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {!parsedData ? (
            <motion.div 
              key="uploader"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold font-display mb-4">First, your resume</h1>
              <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-md mx-auto">
                We'll use your current resume as a master blueprint to generate tailored versions for every job listing.
              </p>
              <ResumeUploader onParsed={setParsedData} />
            </motion.div>
          ) : (
            <motion.div 
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-xl"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-bold font-display mb-2">Great! We've parsed your resume.</h2>
                  <p className="text-gray-500">Check the information below to make sure it's accurate.</p>
                </div>
                <button 
                  onClick={() => setParsedData(null)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Re-upload
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-10 h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                <div className="space-y-6">
                  <Section title="Personal Info">
                    <p className="font-bold text-lg">{parsedData.personalInfo?.name}</p>
                    {parsedData.personalInfo?.professionalTitles?.length > 0 && (
                      <p className="text-xs text-primary font-bold uppercase tracking-tight mb-2">
                        {parsedData.personalInfo.professionalTitles.join(' • ')}
                      </p>
                    )}
                    <p className="text-gray-600 dark:text-gray-400">{parsedData.personalInfo?.email}</p>
                    <p className="text-gray-600 dark:text-gray-400">{parsedData.personalInfo?.phone}</p>
                  </Section>

                  <Section title="Summary">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">
                      "{parsedData.summary || parsedData.professionalSummary}"
                    </p>
                  </Section>

                  <Section title="Competencies & Skills">
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(parsedData.skills) ? (
                        parsedData.skills.slice(0, 10).map((s: any, i: number) => (
                          <span key={`onboard-skill-obj-${i}`} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-[10px] font-bold text-gray-600 dark:text-gray-300">
                            {s.name} <span className="opacity-50">• {s.level}</span>
                          </span>
                        ))
                      ) : (
                        parsedData.skills?.technical?.slice(0, 8).map((s: string, i: number) => (
                          <span key={`onboard-skill-str-${i}`} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                            {s}
                          </span>
                        ))
                      )}
                    </div>
                  </Section>
                </div>

                <div className="space-y-6">
                  <Section title="Experience">
                    {parsedData.experience?.map((exp: any, i: number) => (
                      <div key={`onboard-exp-${i}`} className="mb-4 last:mb-0">
                        <p className="font-bold text-sm">{exp.jobTitle}</p>
                        <p className="text-xs text-primary font-medium">{exp.company}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{exp.startDate} - {exp.endDate}</p>
                      </div>
                    ))}
                  </Section>

                  <Section title="Education">
                    {parsedData.education?.map((edu: any, i: number) => (
                      <div key={`onboard-edu-${i}`} className="mb-4 last:mb-0">
                        <p className="font-bold text-sm">{edu.degree}</p>
                        <p className="text-xs text-gray-600">{edu.institution}</p>
                      </div>
                    ))}
                  </Section>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button 
                  onClick={handleConfirm}
                  className="bg-primary text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                >
                  Looks Good! Continue <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl border border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">{title}</h3>
      {children}
    </div>
  );
}
