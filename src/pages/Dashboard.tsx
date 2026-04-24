import React, { useEffect, useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import JobCard from '../components/job/JobCard';
import JobAddModal from '../components/job/JobAddModal';
import ThemeToggle from '../components/ui/ThemeToggle';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { Plus, Briefcase, Target, CheckCircle2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'jobs'),
      orderBy('addedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(jobList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDeleteJob = async (id: string) => {
    if (!user) return;
    if (window.confirm('Are you sure you want to remove this job?')) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'jobs', id));
        toast.success('Job removed');
      } catch (error) {
        toast.error('Failed to remove job');
      }
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.jobData.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.jobData.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: jobs.length,
    highMatch: jobs.filter(j => j.matchScore >= 80).length,
    applied: jobs.filter(j => j.status === 'Applied').length,
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#08090d]">
      <Sidebar />
      
      <main className="flex-1 p-10 max-w-7xl mx-auto w-full">
        <header className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-black font-display tracking-tight mb-2">Dashboard</h1>
            <p className="text-gray-500 font-medium">Welcome back, {user?.displayName?.split(' ')[0] || 'Seeker'}</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform"
            >
              <Plus size={20} /> Add New Job
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard 
            icon={<Briefcase className="text-blue-500" />} 
            label="Total Saved" 
            value={stats.total} 
            color="bg-blue-50 dark:bg-blue-950/20"
          />
          <StatCard 
            icon={<Target className="text-amber-500" />} 
            label="High Match (80%+)" 
            value={stats.highMatch} 
            color="bg-amber-50 dark:bg-amber-950/20"
          />
          <StatCard 
            icon={<CheckCircle2 className="text-green-500" />} 
            label="Applications" 
            value={stats.applied} 
            color="bg-green-50 dark:bg-green-950/20"
          />
        </section>

        {/* Search & Filter */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by job title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
        </div>

        {/* Job Grid */}
        <section>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} onDelete={handleDeleteJob} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center py-32 bg-white dark:bg-gray-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800"
            >
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-full w-fit mx-auto mb-6">
                <Briefcase className="text-gray-300" size={48} />
              </div>
              <h3 className="text-2xl font-bold font-display mb-2">No jobs tracked yet</h3>
              <p className="text-gray-500 max-w-xs mx-auto mb-8">Add your first job listing to get AI insights and tailored resumes.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-primary font-bold hover:underline"
              >
                Track your first job listing →
              </button>
            </motion.div>
          )}
        </section>

        {isModalOpen && <JobAddModal onClose={() => setIsModalOpen(false)} onAdded={() => {}} />}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 rounded-[2rem] flex items-center gap-6">
      <div className={`${color} p-4 rounded-2xl`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black">{value}</p>
      </div>
    </div>
  );
}
