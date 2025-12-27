import { useState, useCallback } from 'react';
import { GameAction } from '../types';

export const useActionHistory = () => {
    const [history, setHistory] = useState<GameAction[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1); // -1 represents the initial state

    const recordAction = useCallback(
        (action: GameAction) => {
            setHistory((prev) => {
                // If we are in the past, branch off by discarding the future
                const newHistory = prev.slice(0, currentIndex + 1);
                const updated = [...newHistory, action];
                // Update index immediately to maintain consistency
                setCurrentIndex(updated.length - 1);
                return updated;
            });
        },
        [currentIndex]
    );

    const undo = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    }, [currentIndex]);

    const redo = useCallback(() => {
        if (currentIndex < history.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    }, [currentIndex, history.length]);

    const jumpToStep = useCallback(
        (index: number) => {
            if (index >= -1 && index < history.length) {
                setCurrentIndex(index);
            }
        },
        [history.length]
    );

    const importHistory = useCallback((newHistory: GameAction[]) => {
        setHistory(newHistory);
        setCurrentIndex(newHistory.length - 1);
    }, []);

    return {
        history,
        currentIndex,
        recordAction,
        undo,
        redo,
        jumpToStep,
        importHistory,
        canUndo: currentIndex > 0,
        canRedo: currentIndex < history.length - 1,
    };
};
