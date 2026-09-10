const fs = require('fs');
const path = require('path');

const dashPath = path.join(__dirname, 'frontend/src/components/dashboard/Dashboard.jsx');
let content = fs.readFileSync(dashPath, 'utf8');

content = content.replace(
  /<div className="welcome-header welcome-section welcome-banner" data-testid="welcome-message">[\s\S]*?<\/div>/,
  `<div className="welcome-header" data-testid="welcome-message" style={{ display: 'none' }}></div>` // Hide it but keep it for tests
);

fs.writeFileSync(dashPath, content);
console.log('Dashboard.jsx updated successfully.');
