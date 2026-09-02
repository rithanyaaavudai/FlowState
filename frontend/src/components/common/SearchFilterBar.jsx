import React from 'react';

const SearchFilterBar = ({
  placeholder = 'Search...',
  searchValue = '',
  onSearchChange,
  statusFilter = '',
  onFilterChange,
}) => {
  return (
    <div className="search-filter-bar">
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
        />
      </div>

      <div className="filter-select-wrapper">
        <select
          className="status-filter-select"
          value={statusFilter}
          onChange={(e) => onFilterChange && onFilterChange(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="ABANDONED">Abandoned</option>
        </select>
      </div>
    </div>
  );
};

export default SearchFilterBar;
