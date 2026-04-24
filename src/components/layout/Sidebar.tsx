import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, UserCircle, Settings, LogOut, Sparkles } from 'lucide-react';
import { logout } from '../../firebase/auth';

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col p-6 sticky top-0">
      <div className="flex items-center gap-2 mb-10 px-2">
        <Sparkles className="text-primary" size={24} />
        <span className="text-xl font-bold font-display tracking-tight">ApplySync</span>
      </div>

      <div className="flex-1 space-y-2">
        <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <SidebarLink to="/settings" icon={<Settings size={20} />} label="Settings" />
      </div>

      <button 
        onClick={() => logout()}
        className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all font-medium mt-auto"
      >
        <LogOut size={20} /> Sign Out
      </button>
    </div>
  );
}

function SidebarLink({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
        ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}
      `}
    >
      {icon} {label}
    </NavLink>
  );
}
