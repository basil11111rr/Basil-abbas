import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useResume } from '../context/ResumeContext';
import { useNavigate } from 'react-router-dom';
import { User, Moon, Sun, FileText, Trash2, LogOut } from 'lucide-react';
import { logout } from '../firebase/auth';

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { resumeData } = useResume();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#08090d]">
      <Sidebar />
      <main className="flex-1 p-10 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-black font-display mb-12">Settings</h1>

        <div className="space-y-8">
          <section className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2"><User size={20} className="text-primary" /> Profile</h2>
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <img src={user?.photoURL || ''} alt="" className="w-16 h-16 rounded-full border-2 border-primary" />
              <div>
                <p className="font-bold text-lg">{user?.displayName}</p>
                <p className="text-gray-500 text-sm">{user?.email}</p>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2"><Moon size={20} className="text-accent" /> Appearance</h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <span className="font-medium">Dark Mode</span>
              <button 
                onClick={toggleTheme}
                className="w-14 h-8 bg-gray-200 dark:bg-primary rounded-full relative transition-colors"
              >
                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : ''} flex items-center justify-center`}>
                  {theme === 'dark' ? <Moon size={14} className="text-primary" /> : <Sun size={14} className="text-amber-500" />}
                </div>
              </button>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2"><FileText size={20} className="text-green-500" /> Resume Data</h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <div>
                <p className="font-bold">Master Resume</p>
                <p className="text-xs text-gray-500 mt-1">Uploaded and parsed on {new Date().toLocaleDateString()}</p>
              </div>
              <button 
                onClick={() => navigate('/onboarding')}
                className="text-primary font-bold text-sm hover:underline"
              >
                Update Resume
              </button>
            </div>
          </section>

          <button 
            onClick={() => logout()}
            className="w-full p-6 text-red-500 font-bold bg-red-50 dark:bg-red-950/20 rounded-[2rem] flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
          >
            <LogOut size={20} /> Sign Out of ApplySync
          </button>
        </div>
      </main>
    </div>
  );
}
