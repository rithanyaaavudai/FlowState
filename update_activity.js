const fs = require('fs');
const path = require('path');

const actPath = path.join(__dirname, 'frontend/src/components/dashboard/RecentActivity.jsx');
let content = fs.readFileSync(actPath, 'utf8');

content = content.replace(
  "import React from 'react';",
  "import React from 'react';\nimport { Clock, AlertTriangle } from 'lucide-react';"
);

content = content.replace(
  /{item.type === 'SESSION' \? '⏱️' : '⚠️'}/,
  `{item.type === 'SESSION' ? <Clock size={20} color="var(--accent-cyan)" /> : <AlertTriangle size={20} color="var(--warning-border)" />}`
);

fs.writeFileSync(actPath, content);
console.log('RecentActivity.jsx updated successfully.');
