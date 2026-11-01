const fs = require('fs');
const path = require('path');

// 1. Update Dashboard.jsx
const dashPath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'Dashboard.jsx');
let dash = fs.readFileSync(dashPath, 'utf8');

dash = dash.replace(
  '<div data-reveal className="relative revealed">',
  '<div data-reveal className="relative revealed overflow-hidden rounded-2xl">'
);

dash = dash.replace(
  '<div id="triage-table" className="hidden lg:block w-full">',
  '<div id="triage-table" className="hidden lg:block w-full overflow-x-auto">'
);

dash = dash.replace(
  'grid xl:grid-cols-[minmax(260px,2fr)_150px_120px_minmax(220px,2fr)_200px_180px] grid-cols-[minmax(260px,2.5fr)_120px_minmax(220px,2.5fr)_200px_180px]',
  'grid xl:grid-cols-[minmax(220px,2fr)_140px_110px_minmax(180px,2fr)_170px_160px] grid-cols-[minmax(220px,2.5fr)_110px_minmax(180px,2.5fr)_170px_160px]'
);

dash = dash.replace(
  'grid xl:grid-cols-[minmax(260px,2fr)_150px_120px_minmax(220px,2fr)_200px_180px] grid-cols-[minmax(260px,2.5fr)_120px_minmax(220px,2.5fr)_200px_180px]',
  'grid xl:grid-cols-[minmax(220px,2fr)_140px_110px_minmax(180px,2fr)_170px_160px] grid-cols-[minmax(220px,2.5fr)_110px_minmax(180px,2.5fr)_170px_160px]'
);

fs.writeFileSync(dashPath, dash, 'utf8');
console.log('Patched Dashboard.jsx');

// 2. Update App.jsx
const appPath = path.join(__dirname, '..', 'frontend', 'src', 'App.jsx');
let app = fs.readFileSync(appPath, 'utf8');

app = app.replace(
  'className="flex-1 overflow-y-auto min-h-0 bg-transparent p-3 sm:p-5 lg:p-6 pb-12 w-full min-w-0 scrollbar-slim relative z-10 focus:outline-none"',
  'className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 bg-transparent p-3 sm:p-5 lg:p-6 pb-12 w-full min-w-0 scrollbar-slim relative z-10 focus:outline-none"'
);

fs.writeFileSync(appPath, app, 'utf8');
console.log('Patched App.jsx');
