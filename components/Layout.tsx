
import React, { ReactNode, useState } from 'react';
import { ContentMode, UserTier } from '../types';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  mode: ContentMode;
  apiKey: string;
  setApiKey: (key: string) => void;
  tier: UserTier;
  setTier: (tier: UserTier) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
    children, 
    mode, 
    apiKey, 
    setApiKey,
    tier,
    setTier
}) => {
  const isSun = mode === ContentMode.SUN;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen transition-colors duration-700 ease-in-out flex ${
      isSun 
        ? 'bg-gradient-to-br from-orange-50 via-sky-50 to-blue-50 text-slate-800' 
        : 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-indigo-50'
    }`}>
      
      {/* Sidebar */}
      <Sidebar 
        apiKey={apiKey}
        setApiKey={setApiKey}
        tier={tier}
        setTier={setTier}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-72 transition-all duration-300">
          <header className={`p-4 md:p-6 sticky top-0 z-30 backdrop-blur-md border-b flex items-center justify-between ${
            isSun ? 'border-orange-100/50 bg-white/60' : 'border-indigo-800/50 bg-slate-900/60'
          }`}>
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden p-2 rounded-lg bg-gray-500/10 hover:bg-gray-500/20"
                >
                    ☰
                </button>
                <div className="flex flex-col">
                     <h1 className={`text-lg md:text-xl font-bold tracking-tight ${
                        isSun ? 'text-orange-600' : 'text-indigo-300'
                     }`}>
                        Cila Content Engine
                     </h1>
                     <span className="text-[10px] md:hidden opacity-60">
                         {tier === UserTier.FREE ? 'Free Tier' : 'PRO Tier'}
                     </span>
                </div>
            </div>
            
            <div className={`hidden md:block text-xs px-3 py-1 rounded-full border font-medium ${
              isSun ? 'border-orange-200 bg-orange-50 text-orange-600' : 'border-indigo-700 bg-indigo-900 text-indigo-300'
            }`}>
               v2.0 (Angle System Active)
            </div>
          </header>

          <main className="max-w-5xl mx-auto p-4 md:p-6">
            {children}
          </main>
      </div>
    </div>
  );
};
