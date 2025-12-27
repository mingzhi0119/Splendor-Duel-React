import React from 'react';
import { Info, Wifi, WifiOff } from 'lucide-react';

interface StatusBarProps {
    errorMsg: string | null;
    isOnline?: boolean;
    connectionStatus?: 'disconnected' | 'connecting' | 'connected';
}

export const StatusBar: React.FC<StatusBarProps> = ({ errorMsg, isOnline, connectionStatus }) => {
    return (
        <div className="relative flex flex-col items-center gap-2">
            <div
                className={`absolute -top-12 bg-red-500/90 text-white px-4 py-1.5 rounded-full shadow-xl text-sm font-semibold transition-all duration-300 z-50 flex items-center gap-2 whitespace-nowrap ${errorMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
            >
                <Info size={14} /> {errorMsg}
            </div>

            {isOnline && (
                <div
                    className={`absolute -top-20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all
                    ${connectionStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}
                `}
                >
                    {connectionStatus === 'connected' ? (
                        <>
                            <Wifi size={12} /> Live Link
                        </>
                    ) : (
                        <>
                            <WifiOff size={12} /> Sync Lost
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
