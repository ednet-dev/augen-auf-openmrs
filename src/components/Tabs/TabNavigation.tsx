import React, { useRef, useEffect } from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react';
import { useTabNavigation } from './TabContext';
import { TabId, TabConfig } from '../../types/navigation';
import styles from './tab-navigation.scss';

/**
 * TabNavigation Component
 *
 * STREAM B: Navigation + Visits
 * Provides 5-tab navigation: Registration, Form, Visits, Conditions, Therapies
 *
 * Features:
 * - URL synchronization (?tab=registration)
 * - Keyboard navigation (Arrow keys, Tab, Enter)
 * - Accessible ARIA labels
 */

interface TabNavigationProps {
  children?: {
    registration?: React.ReactNode;
    form?: React.ReactNode;
    visits?: React.ReactNode;
    conditions?: React.ReactNode;
    therapies?: React.ReactNode;
  };
}

const TAB_CONFIGS: TabConfig[] = [
  { id: 'registration', label: 'Registration' },
  { id: 'form', label: 'Form' },
  { id: 'visits', label: 'Visits' },
  { id: 'conditions', label: 'Conditions' },
  { id: 'therapies', label: 'Therapies' },
];

const TabNavigation: React.FC<TabNavigationProps> = ({ children = {} }) => {
  const { activeTab, setActiveTab } = useTabNavigation();
  const tabListRef = useRef<HTMLDivElement>(null);

  // Get the index of the active tab
  const selectedIndex = TAB_CONFIGS.findIndex((tab) => tab.id === activeTab);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!tabListRef.current?.contains(document.activeElement)) {
        return;
      }

      const currentIndex = selectedIndex;
      let nextIndex = currentIndex;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          nextIndex = currentIndex > 0 ? currentIndex - 1 : TAB_CONFIGS.length - 1;
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextIndex = currentIndex < TAB_CONFIGS.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'Home':
          event.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          nextIndex = TAB_CONFIGS.length - 1;
          break;
        default:
          return;
      }

      setActiveTab(TAB_CONFIGS[nextIndex].id);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, setActiveTab]);

  return (
    <div className={styles.tabNavigationContainer}>
      <Tabs
        selectedIndex={selectedIndex}
        onChange={({ selectedIndex: newIndex }) => {
          if (newIndex >= 0 && newIndex < TAB_CONFIGS.length) {
            setActiveTab(TAB_CONFIGS[newIndex].id);
          }
        }}
      >
        <TabList
          aria-label="Patient workflow tabs"
          contained
          ref={tabListRef}
        >
          {TAB_CONFIGS.map((tab) => (
            <Tab
              key={tab.id}
              disabled={tab.disabled}
            >
              {tab.label}
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          {TAB_CONFIGS.map((tab) => (
            <TabPanel key={tab.id}>
              <div className={styles.tabContent}>
                {children[tab.id] || (
                  <div className={styles.placeholderContent}>
                    <p>{tab.label} content will be implemented here</p>
                  </div>
                )}
              </div>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default TabNavigation;
