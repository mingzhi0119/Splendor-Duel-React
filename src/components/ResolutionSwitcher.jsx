import React from 'react';
import { Monitor } from 'lucide-react';

export const ResolutionSwitcher = ({ settings, resolution, setResolution, RESOLUTION_SETTINGS, theme }) => {
    return (
        <div className="relative z-50 group">
            <button className={`p-2 rounded-lg backdrop-blur-md border shadow-xl flex items-center gap-2 transition-all
                ${theme === 'dark' 
                    ? 'bg-slate-800/80 hover:bg-slate-700 text-white border-slate-600' 
                    : 'bg-white/80 hover:bg-slate-50 text-slate-800 border-slate-300'
                }
            `}>
                <Monitor size={16} />
                <span className="text-xs font-bold hidden md:inline">{settings.label}</span>
            </button>
            
            <div className="absolute right-0 top-full pt-2 hidden group-hover:block w-32 animate-in fade-in slide-in-from-top-2">
                <div className={`rounded-lg shadow-xl border overflow-hidden transition-colors duration-500
                    ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}
                `}>
                    {Object.entries(RESOLUTION_SETTINGS).map(([key, config]) => (
                        <button 
                            key={key}
                            onClick={() => setResolution(key)}
                            className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors 
                                ${resolution === key ? 'text-emerald-400 ' + (theme === 'dark' ? 'bg-slate-900' : 'bg-emerald-50') : (theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100')}`}
                        >
                            {config.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
