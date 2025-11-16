
import React, { createContext, useContext } from 'react';
import { UseStore } from './types';

// Create a context with a null default value, which will be provided by the App component.
export const StoreContext = createContext<UseStore | null>(null);

/**
 * A custom hook to consume the store context.
 * This ensures that any component using this hook gets access to the latest store data
 * and throws an error if used outside of a StoreProvider.
 */
export const useAppStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useAppStore must be used within a StoreProvider');
  }
  return context;
};