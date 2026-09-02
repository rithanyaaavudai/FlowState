import React from 'react';

const DomainChart = ({ title = 'Session Breakdown', data = {} }) => {
  // data can be object e.g. { DEEP_WORK: 12, CREATIVE: 5, REVIEW: 3 }
  // or array e.g. [{ type: 'DEEP_WORK', count: 12 }, ...]
  const items = Array.isArray(data)
    ? data
    : Object.entries(data || {}).map(([key, val]) => ({
        type: key,
        count: typeof val === 'number' ? val : val?.count || 0,
      }));

  const maxVal = Math.max(...items.map((it) => it.count), 1);
  const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  return (
    <div className="dashboard-chart-card">
      <h3>{title}</h3>

      {items.length === 0 ? (
        <p className="no-chart-data">No analytics data available</p>
      ) : (
        <div className="chart-container">
          <div className="bar-chart">
            {items.map((item, idx) => {
              const label = (item.type || item.name || 'Other').replace('_', ' ');
              const percentage = Math.round((item.count / maxVal) * 100);
              const color = colors[idx % colors.length];

              return (
                <div key={idx} className="bar-group">
                  <div className="bar-label-top">{item.count}</div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        height: `${Math.max(percentage, 8)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  <div className="bar-label-bottom">{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainChart;
