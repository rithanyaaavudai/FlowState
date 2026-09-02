import React from 'react';

const CapacityFilter = ({
  dayFilter = '',
  onDayFilterChange,
  typeFilter = '',
  onTypeFilterChange,
}) => {
  return (
    <div className="capacity-filter">
      <div className="filter-group">
        <label htmlFor="day-filter">Day of Week</label>
        <select
          id="day-filter"
          value={dayFilter}
          onChange={(e) => onDayFilterChange && onDayFilterChange(e.target.value)}
        >
          <option value="">All Days</option>
          <option value="MONDAY">Monday</option>
          <option value="TUESDAY">Tuesday</option>
          <option value="WEDNESDAY">Wednesday</option>
          <option value="THURSDAY">Thursday</option>
          <option value="FRIDAY">Friday</option>
          <option value="SATURDAY">Saturday</option>
          <option value="SUNDAY">Sunday</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="type-filter">Session Type</label>
        <select
          id="type-filter"
          value={typeFilter}
          onChange={(e) => onTypeFilterChange && onTypeFilterChange(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="DEEP_WORK">Deep Work</option>
          <option value="CREATIVE">Creative</option>
          <option value="REVIEW">Review</option>
        </select>
      </div>
    </div>
  );
};

export default CapacityFilter;
