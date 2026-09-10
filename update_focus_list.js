const fs = require('fs');
const path = require('path');

const fileP = path.join(__dirname, 'frontend/src/components/focusSession/FocusSessionList.jsx');
let content = fs.readFileSync(fileP, 'utf8');

content = content.replace(
  "import { fetchMySessions, deleteSession, startSession, completeSession, abandonSession } from '../../store/slices/focusSessionSlice';",
  "import { fetchMySessions, deleteSession, startSession, completeSession, abandonSession } from '../../store/slices/focusSessionSlice';\nimport { Play, Edit2, Trash2, Check, XCircle } from 'lucide-react';"
);

// Replace button texts with icons
content = content.replace(/>\s*Start\s*<\/button>/g, '><Play size={14} /> Start</button>');
content = content.replace(/>\s*Edit\s*<\/button>/g, '><Edit2 size={14} /> Edit</button>');
content = content.replace(/>\s*Delete\s*<\/button>/g, '><Trash2 size={14} /> Delete</button>');
content = content.replace(/>\s*Complete\s*<\/button>/g, '><Check size={14} /> Complete</button>');
content = content.replace(/>\s*Abandon\s*<\/button>/g, '><XCircle size={14} /> Abandon</button>');

// Replace Create button
content = content.replace(
  /<button\s*className="btn primary-btn"\s*onClick=\{\(\) => \{[\s\S]*?\}\s*>\s*Create Session\s*<\/button>/,
  (match) => match.replace('>Create Session</button>', '><Play size={16} /> Create Session</button>')
);

fs.writeFileSync(fileP, content);
console.log('FocusSessionList.jsx updated successfully.');
