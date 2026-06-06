import fs from 'fs';
const r = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const cwd = process.cwd();
const rows = [];
for (const f of r) {
  const m = f.messages.find(x => x.ruleId === 'max-lines');
  if (!m) continue;
  const n = Number((m.message.match(/\((\d+)\)/) || [])[1] || 0);
  const rel = f.filePath.replace(cwd, '').replace(/\\/g, '/').replace(/^\//, '');
  rows.push([n, rel]);
}
rows.sort((a, b) => b[0] - a[0]);
console.log('TOTAL oversized files:', rows.length);
for (const [n, p] of rows) console.log(String(n).padStart(4), p);
