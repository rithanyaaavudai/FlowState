const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'frontend/public/index.html');
let content = fs.readFileSync(htmlPath, 'utf8');

content = content.replace('<title>React App</title>', `<title>FlowState</title>\n    <link rel="preconnect" href="https://fonts.googleapis.com" />\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />`);

fs.writeFileSync(htmlPath, content);
console.log('index.html updated successfully.');
