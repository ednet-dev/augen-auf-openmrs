import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TabId, TabContextValue } from '../../types/navigation';

/**
 * Tab Navigation Context
 *
 * CONTRACT B→D: Exported for Stream D (Registration tab)
 * Provides centralized tab state management with URL synchronization
 */

const TabContext = createContext<TabContextValue | null>(null);

interface TabProviderProps {
  children: ReactNode;
  defaultTab?: TabId;
}

export const TabProvider: React.FC<TabProviderProps> = ({
  children,
  defaultTab = 'form',
}) => {
  const [activeTab, setActiveTabState] = useState<TabId>(defaultTab);

  // Sync with URL query params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as TabId;

    if (tabParam && isValidTabId(tabParam)) {
      setActiveTabState(tabParam);
    }
  }, []);

  // Update URL when tab changes
  const setActiveTab = (tab: TabId) => {
    setActiveTabState(tab);

    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
  };

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  );
};

/**
 * Hook to access tab navigation context
 *
 * CONTRACT B→D: Exported for Stream D
 * @throws Error if used outside TabProvider
 */
export const useTabNavigation = (): TabContextValue => {
  const context = useContext(TabContext);

  if (!context) {
    throw new Error('useTabNavigation must be used within a TabProvider');
  }

  return context;
};

// Helper to validate tab IDs
function isValidTabId(id: string): id is TabId {
  return ['registration', 'form', 'visits', 'conditions', 'therapies'].includes(id);
}

export { TabContext };
