const fs = require('fs');
const p = 'C:\\Users\\hpi7\\Downloads\\mpx-admin\\mpx-admin\\src\\app\\api\\admin\\kyc\\route.js';
let c = fs.readFileSync(p, 'utf8');
c = c.replace("import { NextResponse } from 'next/server';", "import { NextResponse } from 'next/server';\n\nexport const dynamic = 'force-dynamic';");
fs.writeFileSync(p, c);
console.log('Done');
