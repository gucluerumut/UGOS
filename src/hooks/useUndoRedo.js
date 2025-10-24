import { useState, useCallback, useRef } from 'react';

const useUndoRedo = (initialState, maxHistorySize = 50) => {
  const [state, setState] = useState(initialState);
  const [history, setHistory] = useState([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isUndoRedoAction = useRef(false);

  const updateState = useCallback((newState) => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    setState(newState);
    
    setHistory(prevHistory => {
      const newHistory = prevHistory.slice(0, currentIndex + 1);
      newHistory.push(newState);
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        return newHistory.slice(-maxHistorySize);
      }
      
      return newHistory;
    });
    
    setCurrentIndex(prevIndex => {
      const newIndex = prevIndex + 1;
      return newIndex >= maxHistorySize ? maxHistorySize - 1 : newIndex;
    });
  }, [currentIndex, maxHistorySize]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const previousState = history[newIndex];
      
      isUndoRedoAction.current = true;
      setState(previousState);
      setCurrentIndex(newIndex);
      
      return previousState;
    }
    return state;
  }, [currentIndex, history, state]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      const nextState = history[newIndex];
      
      isUndoRedoAction.current = true;
      setState(nextState);
      setCurrentIndex(newIndex);
      
      return nextState;
    }
    return state;
  }, [currentIndex, history, state]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const clearHistory = useCallback(() => {
    setHistory([state]);
    setCurrentIndex(0);
  }, [state]);

  const getHistoryInfo = useCallback(() => {
    return {
      currentIndex,
      historyLength: history.length,
      canUndo,
      canRedo
    };
  }, [currentIndex, history.length, canUndo, canRedo]);

  return {
    state,
    updateState,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    getHistoryInfo
  };
};

export default useUndoRedo;