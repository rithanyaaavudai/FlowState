const fs = require('fs');
const path = require('path');

const emptyPath = path.join(__dirname, 'frontend/src/components/common/EmptyState.jsx');
let content = fs.readFileSync(emptyPath, 'utf8');

content = content.replace(
  "import React from 'react';",
  "import React from 'react';\nimport { Inbox } from 'lucide-react';"
);

const newReturn = `  return (
    <div className="empty-state-wrapper">
      <div className="empty-state-icon">
        {icon || <Inbox size={64} />}
      </div>
      <h3 className="empty-state-title">No data to display</h3>
      <p className="empty-state-desc">{message}</p>
    </div>
  );`;

content = content.replace(/return \([\s\S]*?\);\n/g, newReturn + '\n');

fs.writeFileSync(emptyPath, content);
console.log('EmptyState.jsx updated successfully.');
