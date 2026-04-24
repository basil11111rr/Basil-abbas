import React from 'react';
import { Calendar, Building2, MapPin, TrendingUp, AlertCircle, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface JobCardProps {
  key?: React.Key;
  job: any;
  onDelete: (id: string) => void | Promise<void>;
}

export default function JobCard({ job, onDelete }: JobCardProps) {
  const { jobData, matchScore, status, addedAt, id } = job;
  
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Saved': return 'bg-gray-100 text-gray-500';
      case 'Applied': return 'bg-blue-100 text-blue-600';
      case 'Interview': return 'bg-purple-100 text-purple-600';
      case 'Offer': return 'bg-green-100 text-green-600';
      case 'Rejected': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 border-green-500 bg-green-50/50';
    if (score >= 50) return 'text-amber-500 border-amber-500 bg-amber-50/50';
    return 'text-red-500 border-red-500 bg-red-50/50';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-[2rem] hover:shadow-xl transition-all relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-primary border border-gray-100 dark:border-gray-700 font-bold text-xl uppercase font-display">
            {jobData.company?.charAt(0) || '?'}
          </div>
          <div>
            <h3 className="text-lg font-bold font-display group-hover:text-primary transition-colors pr-8">
              <Link to={`/job/${id}`}>{jobData.jobTitle}</Link>
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1"><Building2 size={14} /> {jobData.company}</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {jobData.location}</span>
            </div>
          </div>
        </div>
        
        <div className={`px-4 py-8 border rounded-2xl flex flex-col items-center justify-center gap-1 ${getScoreColor(matchScore)}`}>
          <span className="text-xs font-bold uppercase tracking-tighter opacity-70">Match</span>
          <span className="text-xl font-black">{matchScore}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(status)}`}>
            {status}
          </span>
          <span className="text-[10px] text-gray-400 flex items-center gap-1 uppercase tracking-wider font-bold">
            <Calendar size={12} /> {new Date(addedAt?.seconds * 1000).toLocaleDateString()}
          </span>
        </div>
        
        <button 
          onClick={() => onDelete(id)}
          className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {jobData.redFlags?.length > 2 && (
        <div className="absolute top-0 right-0 p-1">
          <div className="bg-red-500 p-1 rounded-bl-xl text-white shadow-lg animate-pulse">
            <AlertCircle size={16} />
          </div>
        </div>
      )}
    </motion.div>
  );
}
