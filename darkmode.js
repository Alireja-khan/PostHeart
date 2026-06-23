const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacements = [
  { from: /bg-\[\#f9f8f6\]/g, to: "bg-[#111111]" },
  { from: /bg-\[\#f4f5f7\]/g, to: "bg-[#111111]" },
  { from: /bg-white/g, to: "bg-[#1a1a1a]" },
  { from: /bg-\[\#fafafa\]/g, to: "bg-[#222222]" },
  { from: /bg-stone-50\/50/g, to: "bg-[#1a1a1a]" },
  { from: /bg-stone-50\/20/g, to: "bg-[#1a1a1a]" },
  { from: /bg-stone-50/g, to: "bg-[#1a1a1a]" },
  
  { from: /border-\[\#e6e4df\]/g, to: "border-[#333333]" },
  { from: /border-\[\#eaeaea\]/g, to: "border-[#333333]" },

  { from: /text-\[\#1a1a1a\]/g, to: "text-[#f9f8f6]" },
  { from: /text-\[\#111111\]/g, to: "text-[#f9f8f6]" },
  { from: /text-\[\#707070\]/g, to: "text-[#a0a0a0]" },
  { from: /text-\[\#888888\]/g, to: "text-[#a0a0a0]" },

  // hover states
  { from: /hover:text-\[\#1a1a1a\]/g, to: "hover:text-[#f9f8f6]" },
  { from: /hover:text-\[\#111111\]/g, to: "hover:text-[#f9f8f6]" },
  { from: /hover:bg-\[\#f9f8f6\]/g, to: "hover:bg-[#222222]" },
  { from: /hover:bg-\[\#fafafa\]/g, to: "hover:bg-[#222222]" }
];

walkDir('src/app', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    for (let r of replacements) {
      newContent = newContent.replace(r.from, r.to);
    }
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      console.log('Updated', filePath);
    }
  }
});

walkDir('src/components', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    // Skip Sidebar since it's already dark and we don't want to mess it up
    if (filePath.includes('Sidebar.tsx') && !filePath.includes('NotificationSidebar.tsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    for (let r of replacements) {
      newContent = newContent.replace(r.from, r.to);
    }
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent);
      console.log('Updated', filePath);
    }
  }
});
