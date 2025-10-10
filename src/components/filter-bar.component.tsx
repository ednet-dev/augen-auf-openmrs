import React from 'react';
import { Layer, Dropdown, Search } from '@carbon/react';
import { DateFiltersConfig } from '../types';
import styles from './filter-bar.scss';

interface FilterBarProps {
  dateFilters: DateFiltersConfig;
  selectedDateFilter: keyof DateFiltersConfig;
  searchQuery: string;
  onDateFilterChange: (filter: keyof DateFiltersConfig) => void;
  onSearchChange: (query: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  dateFilters,
  selectedDateFilter,
  searchQuery,
  onDateFilterChange,
  onSearchChange,
}) => {
  const dateFilterItems = Object.entries(dateFilters).map(([key, filter]) => ({
    id: key,
    label: filter.label,
  }));

  return (
    <Layer className={styles.filterSection}>
      <Dropdown
        id="date-filter"
        titleText="Filter by Date"
        label="Select date range"
        items={dateFilterItems}
        itemToString={(item) => item?.label || ''}
        selectedItem={dateFilterItems.find((item) => item.id === selectedDateFilter)}
        onChange={({ selectedItem }) =>
          onDateFilterChange(selectedItem.id as keyof DateFiltersConfig)
        }
      />

      <Search
        id="patient-search"
        labelText="Search for Patient"
        placeholder="Search for Patient"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        size="sm"
      />
    </Layer>
  );
};

export default FilterBar;
