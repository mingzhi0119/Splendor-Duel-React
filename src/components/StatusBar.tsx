import React from 'react';
import { Info } from 'lucide-react';

interface StatusBarProps {
    errorMsg: string | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({ errorMsg }) => {
    return (
        <div
            className={`absolute -top-12 bg-red-500/90 text-white px-4 py-1.5 rounded-full shadow-xl text-sm font-semibold transition-all duration-300 z-50 flex items-center gap-2 whitespace-nowrap ${errorMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        >
            <Info size={14} /> {errorMsg}
        </div>
    );
};
