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
      
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        // If it doesn't have a specific bright background, adjust text-emerald-[789]00
        if (!lines[i].includes('bg-emerald-') && !lines[i].includes('bg-amber-') && !lines[i].includes('bg-rose-') && !lines[i].includes('bg-blue-')) {
          lines[i] = lines[i].replace(/\btext-(emerald|blue|amber|rose)-(700|800|900)\b/g, (match, color, shade) => {
            return `text-${color}-600 dark:text-${color}-400`;
          });
        }
      }
      content = lines.join('\n');
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

processDirectory(dir);
console.log('Fix complete!');
