const fs = require('fs');
const path = require('path');

const dir = './src';

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Backgrounds
      content = content.replace(/\bbg-white\b/g, 'bg-card');
      content = content.replace(/\bbg-slate-50\b/g, 'bg-background');
      content = content.replace(/\bbg-slate-100\b/g, 'bg-muted');
      content = content.replace(/\bbg-slate-200\b/g, 'bg-muted/80');
      
      // Foreground Text
      content = content.replace(/\btext-slate-900\b/g, 'text-foreground');
      content = content.replace(/\btext-slate-800\b/g, 'text-foreground/90');
      content = content.replace(/\btext-slate-700\b/g, 'text-muted-foreground');
      content = content.replace(/\btext-slate-600\b/g, 'text-muted-foreground/90');
      content = content.replace(/\btext-slate-500\b/g, 'text-muted-foreground/70');
      content = content.replace(/\btext-slate-400\b/g, 'text-muted-foreground/50');
      content = content.replace(/\btext-slate-300\b/g, 'text-muted-foreground/30');
      
      // Borders
      content = content.replace(/\bborder-slate-200\b/g, 'border-border');
      content = content.replace(/\bborder-slate-100\b/g, 'border-border/50');
      content = content.replace(/\bborder-slate-300\b/g, 'border-border-strong');
      content = content.replace(/\bborder-slate-800\b/g, 'border-border-alt'); // used in dark footers

      // Alt background (slate-900)
      content = content.replace(/\bbg-slate-900\b/g, 'bg-alt');
      content = content.replace(/\bbg-slate-800\b/g, 'bg-alt/90');
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

processDirectory(dir);
console.log('Refactor complete!');
