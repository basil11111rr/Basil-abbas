import React from 'react';
import { motion } from 'motion/react';
import { signInWithGoogle } from '../firebase/auth';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, BarChart3 } from 'lucide-react';

export default function Landing() {
  const { user } = useAuth();

  if (user) return <Navigate to="/dashboard" />;

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in failed", error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <Sparkles className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold font-display tracking-tight">ApplySync</span>
        </div>
        <button 
          onClick={handleSignIn}
          className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary-dark transition-all"
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold font-display leading-tight mb-6">
            Your AI-Powered <br />
            <span className="text-primary">Job Application Co-Pilot</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            ApplySync helps you land interviews by optimizing your resume for every job,
            detecting scams, and generating professional cover letters in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleSignIn}
              className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95"
            >
              Get Started for Free <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32">
          <FeatureCard 
            icon={<Zap className="text-amber-500" />}
            title="ATS Optimization"
            description="Tailor your resume with AI to match specific job listings and pass automated screeners."
          />
          <FeatureCard 
            icon={<ShieldCheck className="text-green-500" />}
            title="Scam Detection"
            description="Our AI identifies high-risk job listings so you can focus on legitimate opportunities."
          />
          <FeatureCard 
            icon={<BarChart3 className="text-blue-500" />}
            title="Application Tracker"
            description="Keep track of every application, status, and interview in one clean dashboard."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-left hover:shadow-xl transition-shadow">
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl w-fit mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold font-display mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
