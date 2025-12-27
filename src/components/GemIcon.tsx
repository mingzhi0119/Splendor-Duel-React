import React from 'react';
import { GemTypeObject } from '../types';

interface GemIconProps {
    type: GemTypeObject;
    size?: string;
    className?: string;
    count?: number;
}

export const GemIcon: React.FC<GemIconProps> = ({
    type,
    size = 'w-6 h-6',
    className = '',
    count,
}) => (
    <div
        className={`relative ${size} rounded-full bg-gradient-to-br ${type.color} border ${type.border} shadow-sm ${className}`}
        title={type.label}
    >
        {type.id === 'pearl' && (
            <span className="flex h-full items-center justify-center text-[10px] font-bold text-pink-900">
                P
            </span>
        )}
        {type.id === 'gold' && (
            <span className="flex h-full items-center justify-center text-[10px] font-bold text-yellow-900">
                G
            </span>
        )}
        {count !== undefined && (
            <span className="absolute -bottom-1 -right-1 z-10 rounded-full border border-slate-600 bg-slate-900 px-1.5 text-[10px] font-bold text-white">
                {count}
            </span>
        )}
    </div>
);
