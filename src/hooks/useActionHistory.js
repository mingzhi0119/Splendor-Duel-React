import { useState, useCallback, useEffect } from 'react';

export const useActionHistory = () => {
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 represents the initial state

  const recordAction = useCallback((action) => {
    setHistory(prev => {
      // If we are in the past, branch off by discarding the future
      const newHistory = prev.slice(0, currentIndex + 1);
      return [...newHistory, action];
    });
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, history.length]);

  const jumpToStep = useCallback((index) => {
    if (index >= -1 && index < history.length) {
      setCurrentIndex(index);
    }
  }, [history.length]);

  // Safety: Ensure currentIndex never exceeds history length (Fixes 2/1 bug)
  useEffect(() => {
    if (history.length > 0 && currentIndex >= history.length) {
      setCurrentIndex(history.length - 1);
    }
  }, [history.length, currentIndex]);

  return {
    history,
    currentIndex,
    recordAction,
    undo,
    redo,
    jumpToStep,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1
  };
};