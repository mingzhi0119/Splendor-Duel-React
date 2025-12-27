import React from 'react';

interface FloatingTextProps {
    quantity: string;
    label: string;
}

export const FloatingText: React.FC<FloatingTextProps> = ({ quantity, label }) => {
    const colorClass =
        label.toLowerCase() === 'gold'
            ? 'text-yellow-400'
            : label.toLowerCase() === 'pearl'
              ? 'text-pink-400'
              : label.toLowerCase() === 'privilege'
                ? 'text-amber-400'
                : 'text-emerald-400';

    return (
        <>
            <style>
                {`
          @keyframes floatUpFade {
            0% { opacity: 0; transform: translate(-50%, 50%) scale(0.8); }
            20% { opacity: 1; transform: translate(-50%, 0) scale(1.1); }
            80% { opacity: 1; transform: translate(-50%, -20px) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -40px) scale(0.9); }
          }
          .animate-float-up-fade {
            animation: floatUpFade 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
        `}
            </style>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none z-50 whitespace-nowrap drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] animate-float-up-fade flex items-center gap-1">
                <span
                    className={`font-black text-lg ${quantity.startsWith('+') ? 'text-white' : 'text-red-400'}`}
                >
                    {quantity}
                </span>
                <span className={`${colorClass} font-bold text-sm uppercase tracking-wider`}>
                    {label}
                </span>
            </div>
        </>
    );
};

export const CrownFlash: React.FC = () => {
    return (
        <>
            <style>
                {`
                    @keyframes flashExpand {
                        0% { opacity: 0.8; transform: scale(1); box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.7); }
                        100% { opacity: 0; transform: scale(2.5); box-shadow: 0 0 30px 30px rgba(250, 204, 21, 0); }
                    }
                    .animate-flash-expand {
                        animation: flashExpand 0.8s ease-out forwards;
                    }
                `}
            </style>
            <div className="absolute inset-0 rounded-full bg-yellow-400/30 animate-flash-expand pointer-events-none z-0"></div>
        </>
    );
};
