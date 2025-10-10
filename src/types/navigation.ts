/**
 * Navigation types for tab management
 *
 * CONTRACT B→D: Tab Navigation Context
 * These types are exported for use by Stream D (Actions + UX)
 */

export type TabId = 'registration' | 'form' | 'visits' | 'conditions' | 'therapies';

export interface TabContextValue {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export interface TabConfig {
  id: TabId;
  label: string;
  disabled?: boolean;
}
