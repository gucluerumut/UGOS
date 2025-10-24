import React, { createContext, useContext, useCallback, useRef } from 'react';

const UndoRedoContext = createContext();

export const useUndoRedoContext = () => {
  const context = useContext(UndoRedoContext);
  if (!context) {
    throw new Error('useUndoRedoContext must be used within UndoRedoProvider');
  }
  return context;
};

export const UndoRedoProvider = ({ children }) => {
  const actionsRef = useRef(new Map());
  const historyRef = useRef([]);
  const currentIndexRef = useRef(-1);
  const maxHistorySize = 100;

  const registerAction = useCallback((id, undoAction, redoAction, description) => {
    const action = {
      id,
      undoAction,
      redoAction,
      description,
      timestamp: Date.now()
    };

    // Remove any actions after current index (when new action is performed after undo)
    historyRef.current = historyRef.current.slice(0, currentIndexRef.current + 1);
    
    // Add new action
    historyRef.current.push(action);
    currentIndexRef.current = historyRef.current.length - 1;

    // Limit history size
    if (historyRef.current.length > maxHistorySize) {
      historyRef.current = historyRef.current.slice(-maxHistorySize);
      currentIndexRef.current = maxHistorySize - 1;
    }

    // Store action for potential future use
    actionsRef.current.set(action.id, action);

    return action.id;
  }, []);

  const undo = useCallback(() => {
    if (currentIndexRef.current >= 0) {
      const action = historyRef.current[currentIndexRef.current];
      try {
        action.undoAction();
        currentIndexRef.current--;
        return {
          success: true,
          description: action.description,
          canUndo: currentIndexRef.current >= 0,
          canRedo: currentIndexRef.current < historyRef.current.length - 1
        };
      } catch (error) {
        console.error('Undo action failed:', error);
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'No actions to undo' };
  }, []);

  const redo = useCallback(() => {
    if (currentIndexRef.current < historyRef.current.length - 1) {
      currentIndexRef.current++;
      const action = historyRef.current[currentIndexRef.current];
      try {
        action.redoAction();
        return {
          success: true,
          description: action.description,
          canUndo: currentIndexRef.current >= 0,
          canRedo: currentIndexRef.current < historyRef.current.length - 1
        };
      } catch (error) {
        console.error('Redo action failed:', error);
        currentIndexRef.current--;
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'No actions to redo' };
  }, []);

  const canUndo = useCallback(() => {
    return currentIndexRef.current >= 0;
  }, []);

  const canRedo = useCallback(() => {
    return currentIndexRef.current < historyRef.current.length - 1;
  }, []);

  const clearHistory = useCallback(() => {
    historyRef.current = [];
    currentIndexRef.current = -1;
    actionsRef.current.clear();
  }, []);

  const getHistory = useCallback(() => {
    return {
      actions: historyRef.current.map(action => ({
        id: action.id,
        description: action.description,
        timestamp: action.timestamp
      })),
      currentIndex: currentIndexRef.current,
      canUndo: canUndo(),
      canRedo: canRedo()
    };
  }, [canUndo, canRedo]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key === 'z') {
        event.preventDefault();
        undo();
      } else if (
        ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'Z') ||
        ((event.ctrlKey || event.metaKey) && event.key === 'y')
      ) {
        event.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const value = {
    registerAction,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    getHistory
  };

  return (
    <UndoRedoContext.Provider value={value}>
      {children}
    </UndoRedoContext.Provider>
  );
};