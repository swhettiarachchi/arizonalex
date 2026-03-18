import fs from 'fs';

const code = fs.readFileSync('src/lib/countries-data.ts', 'utf8');
const lines = code.split('\n');
const photos = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('W(') && line.includes(':')) {
    const match = line.match(/'([^']+)': W\('([^']+)'\)/);
    if (match) photos.push({ name: match[1], file: match[2] });
  }
}
console.log('Found ' + photos.length + ' photos to check.');

(async () => {
  let broken = 0;
  for (const p of photos) {
    const url = 'https://commons.wikimedia.org/w/thumb.php?f=' + encodeURIComponent(p.file.replace(/ /g, '_')) + '&w=400';
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (!res.ok) {
        console.log('BROKEN: ' + p.name + ' -> ' + p.file + ' (' + res.status + ')');
        broken++;
      }
    } catch (e) {
      console.log('FAIL: ' + p.name + ' -> ' + p.file + ' - ' + e.message);
      broken++;
    }
  }
  console.log('Done checking. Broken: ' + broken);
})().catch(console.error);
