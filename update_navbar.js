const fs = require('fs');
const path = require('path');

const navbarPath = path.join(__dirname, 'frontend/src/components/layout/Navbar.jsx');
let content = fs.readFileSync(navbarPath, 'utf8');

// Replace imports
content = content.replace(
  "import { logout } from '../../store/slices/authSlice';",
  "import { logout } from '../../store/slices/authSlice';\nimport { Activity, LayoutDashboard, Calendar, Clock, List, Users, ShieldAlert, BarChart3, LogOut, Settings } from 'lucide-react';"
);

// We will inject icons into NavLinks
const navLinkReplacements = [
  { text: ">\\s*Sessions\\s*</NavLink>", newText: "><Clock size={16} /> Sessions</NavLink>" },
  { text: ">\\s*Focus Blocks\\s*</NavLink>", newText: "><Calendar size={16} /> Focus Blocks</NavLink>" },
  { text: ">\\s*All Sessions\\s*</NavLink>", newText: "><List size={16} /> All Sessions</NavLink>" },
  { text: ">\\s*Recommendations\\s*</NavLink>", newText: "><Activity size={16} /> Recommendations</NavLink>" },
  { text: ">\\s*Admin Console\\s*</NavLink>", newText: "><ShieldAlert size={16} /> Admin Console</NavLink>" },
  { text: ">\\s*Analytics\\s*</NavLink>", newText: "><BarChart3 size={16} /> Analytics</NavLink>" },
  { text: ">\\s*Distractions\\s*</NavLink>", newText: "><Settings size={16} /> Distractions</NavLink>" },
  { text: ">\\s*Users\\s*</NavLink>", newText: "><Users size={16} /> Users</NavLink>" }
];

navLinkReplacements.forEach(rep => {
  content = content.replace(new RegExp(rep.text, 'g'), rep.newText);
});

// Replace brand and logout
content = content.replace(
  /<div className="navbar-brand">[\s\S]*?<\/div>/,
  `<div className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Activity color="var(--accent-cyan)" size={24} />
        <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 800 }}>FlowState</Link>
      </div>`
);

content = content.replace(
  /<button\s*type="button"\s*className="btn logout-btn"\s*onClick=\{handleLogout\}\s*>\s*Logout\s*<\/button>/,
  `<button type="button" className="btn logout-btn" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <LogOut size={16} /> Logout
        </button>`
);

content = content.replace(
  /<nav className="navbar" role="navigation">/,
  `<nav className="navbar app-header" role="navigation">`
);

fs.writeFileSync(navbarPath, content);
console.log('Navbar.jsx updated successfully.');
