const fs = require('fs');
const path = require('path');

const pathStat = path.join(__dirname, 'frontend/src/components/dashboard/StatCards.jsx');
let content = fs.readFileSync(pathStat, 'utf8');

content = content.replace(
  "import { useSelector } from 'react-redux';",
  "import { useSelector } from 'react-redux';\nimport { CheckCircle, Clock, TrendingUp } from 'lucide-react';"
);

// We need to replace the return statement entirely
const newReturn = `  return (
    <div className="dashboard-stats-wrapper" style={{ marginBottom: '2rem' }}>
      {isPractitioner && (
        <div className="practitioner-greeting" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Welcome back, {nameToDisplay} 👋</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Here is what's happening with your focus today.</p>
        </div>
      )}

      <div className="stat-cards-grid">
        <div className="stat-card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-label">Total Sessions</div>
            <div className="stat-value">{totalSessions}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)' }}>
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-label">Total Focus Hours</div>
            <div className="stat-value">{totalFocusHours} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>hrs</span></div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-cyan)' }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="stat-label">Avg Focus Score</div>
            <div className="stat-value">{formattedScore}</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-border)' }}>
            <TrendingUp size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCards;`;

content = content.replace(/return \([\s\S]*?\n\};\n\nexport default StatCards;/g, newReturn);

fs.writeFileSync(pathStat, content);
console.log('StatCards.jsx updated successfully.');
