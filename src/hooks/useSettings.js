import { useState } from 'react';

// Resolution Configuration Center
export const RESOLUTION_SETTINGS = {
    '1k': { 
        label: '1080p (FHD)', 
        zoneHeight: 'h-[160px]',
        zoneScale: 'scale-[0.7]',
        boardScale: 'scale-[0.75]',
        deckScale: 'scale-[0.85]'
    },
    '2k': { 
        label: '1440p (2K)', 
        zoneHeight: 'h-[240px]', 
        zoneScale: 'scale-90',   
        boardScale: 'scale-100', 
        deckScale: 'scale-100'
    },
    '4k': { 
        label: '2160p (4K)', 
        zoneHeight: 'h-[320px]', 
        zoneScale: 'scale-125',  
        boardScale: 'scale-[1.4]', 
        deckScale: 'scale-110'
    }
};

// Global Game Configuration (Preserved during Replay)
export const GAME_CONFIG = {
    difficulty: 'NORMAL',
    playerNames: { p1: 'Player 1', p2: 'Player 2' }
};

export const useSettings = (defaultResolution = '2k') => {
    const [resolution, setResolution] = useState(defaultResolution);
    const [theme, setTheme] = useState('dark');

    const settings = RESOLUTION_SETTINGS[resolution];

    return {
        resolution,
        setResolution,
        theme,
        setTheme,
        settings,
        RESOLUTION_SETTINGS,
        GAME_CONFIG
    };
};
