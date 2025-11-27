
import React, { useState, useEffect } from 'react';
import { UserTier } from '../types';

interface SidebarProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  tier: UserTier;
  setTier: (tier: UserTier) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  apiKey, 
  setApiKey, 
  tier, 
  setTier,
  isOpen,
  toggleSidebar
}) => {
  const [showKey, setShowKey] = useState(false);

  // Auto-fill from Google AI Studio environment if available
  useEffect(() => {
    const checkGoogleKey = async () => {
        const aiStudio = (window as any).aistudio;
        if (aiStudio && await aiStudio.hasSelectedApiKey()) {
            // If the environment already has a key selected, we can't extract the string 
            // but we know it's injected into process.env.API_KEY usually. 
            // However, since we are moving to manual input, we provide an option.
            // If the user uses the "Select Google Key" button, the environment might handle it.
        }
    };
    checkGoogleKey();
  }, []);

  const handleGoogleAuth = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
        try {
            await aiStudio.openSelectKey();
            // In a real Google IDX/AI Studio environment, this sets the internal state
            // For this app to work, the user usually still needs to copy-paste the key 
            // unless the environment injects it. 
            // We will prompt them to check their key.
            alert("If you selected a key, please copy it from Google AI Studio settings and paste it here.");
            window.open('https://aistudio.google.com/app/apikey', '_blank');
        } catch (e) {
            console.error(e);
        }
    } else {
        // Fallback: Open URL
        window.open('https://aistudio.google.com/app/apikey', '_blank');
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-slate-900 border-r border-indigo-900 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        
        {/* Header */}
        <div className="p-6 border-b border-indigo-800">
           <div className="flex items-center gap-2 mb-1">
             <span className="text-2xl">✨</span>
             <h1 className="text-lg font-bold text-white tracking-tight">Cila Engine</h1>
           </div>
           <p className="text-xs text-indigo-400">AI Influencer Workspace</p>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-8 overflow-y-auto">
            
            {/* API Key Section */}
            <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    🔑 Gemini API Key
                </label>
                <div className="relative">
                    <input 
                        type={showKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Paste Key Here..."
                        className="w-full bg-slate-950 border border-indigo-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none pr-8"
                    />
                    <button 
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-2 top-2.5 text-gray-500 hover:text-white"
                    >
                        {showKey ? '🙈' : '👁️'}
                    </button>
                </div>
                
                <div className="space-y-2">
                    <button 
                        onClick={handleGoogleAuth}
                        className="w-full py-2 bg-indigo-800 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                       <span className="text-sm">⚡</span> Get Free API Key
                    </button>
                    <p className="text-[10px] text-gray-400 leading-tight">
                        Get your free key at <a href="https://aistudio.google.com" target="_blank" className="text-indigo-400 underline">aistudio.google.com</a>.
                        Without a key, the generator will not work.
                    </p>
                </div>
            </div>

            {/* Tier Section */}
            <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    💎 Membership Tier
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg border border-indigo-900">
                    <button
                        onClick={() => setTier(UserTier.FREE)}
                        className={`py-2 text-xs font-bold rounded-md transition-all ${
                            tier === UserTier.FREE 
                            ? 'bg-indigo-600 text-white shadow-lg' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Free
                    </button>
                    <button
                        onClick={() => setTier(UserTier.PRO)}
                        className={`py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1 ${
                            tier === UserTier.PRO 
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        PRO 🚀
                    </button>
                </div>
                
                {/* Tier Info */}
                <div className="p-3 bg-slate-800/50 rounded-lg border border-indigo-900/50">
                    {tier === UserTier.FREE ? (
                        <div className="space-y-1">
                            <h4 className="text-xs font-bold text-white">Free Plan</h4>
                            <ul className="text-[10px] text-gray-400 space-y-1 list-disc pl-3">
                                <li>Gemini 2.5 Flash (Fast)</li>
                                <li>Standard Image Gen</li>
                                <li>Basic Scripting</li>
                            </ul>
                        </div>
                    ) : (
                         <div className="space-y-1">
                            <h4 className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">PRO Supercharged</h4>
                            <ul className="text-[10px] text-gray-300 space-y-1 list-disc pl-3">
                                <li>Gemini 3.0 Pro (Thinking)</li>
                                <li>Deep Reasoning Scripts</li>
                                <li>Gemini 3.0 Image Preview</li>
                                <li>Advanced Video Prompts</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-indigo-900 text-[10px] text-gray-500 text-center">
            &copy; 2025 Cila Content Engine
        </div>
      </aside>
    </>
  );
};
