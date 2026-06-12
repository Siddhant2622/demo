const fs = require('fs');
const path = require('path');

function findEmptyFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findEmptyFiles(fullPath);
    } else if (stat.isFile() && fullPath.endsWith('.ts')) {
      if (stat.size === 0) {
        console.log('Fixing:', fullPath);
        fs.writeFileSync(fullPath, 'import { NextResponse } from "next/server";\n\nexport async function GET() { return NextResponse.json({ status: "mock" }); }\nexport async function POST() { return NextResponse.json({ status: "mock" }); }\n');
      }
    }
  }
}

findEmptyFiles('src/app/api');
