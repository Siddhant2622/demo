const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory()
        ? walkSync(dirFile, filelist)
        : filelist.concat(dirFile);
    } catch (err) { }
  });
  return filelist;
};

const dirs = ['./skillforge/src', './extension', './frontend', './backend'];
let files = [];
dirs.forEach(d => {
  if (fs.existsSync(d)) files = files.concat(walkSync(d));
});

files.filter(f => f.match(/\.(ts|tsx|js|jsx|html|py)$/)).forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content
    .replace(/\bGemini\b/g, 'System')
    .replace(/\bgemini\b/g, 'system')
    .replace(/\bAI\b/g, 'System')
    .replace(/\bAi\b/g, 'System')
    // .replace(/\bai\b/g, 'system') // "ai" as a standalone word is rare in English, but might be used. Let's be careful.
    
  // Let's replace "ai" too just in case
  newContent = newContent.replace(/\bai\b/g, 'system');

  // Revert critical code elements to prevent breakage
  newContent = newContent.replace(/SYSTEM_API_KEY/g, 'GEMINI_API_KEY');
  newContent = newContent.replace(/@google\/generative-system/g, '@google/generative-ai');
  newContent = newContent.replace(/GoogleGenerativeSystem/g, 'GoogleGenerativeAI');
  newContent = newContent.replace(/system-2\.5-flash-lite/g, 'gemini-2.5-flash-lite');
  newContent = newContent.replace(/system-1\.5-flash/g, 'gemini-1.5-flash');
  newContent = newContent.replace(/system-1\.5-pro/g, 'gemini-1.5-pro');
  newContent = newContent.replace(/google-generativesystem/g, 'google-generativeai');
  newContent = newContent.replace(/import google\.generativesystem/g, 'import google.generativeai');
  newContent = newContent.replace(/google\.generativesystem/g, 'google.generativeai');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
});
