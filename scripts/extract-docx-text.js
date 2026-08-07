const fs = require('fs');

for (const p of ['P_003', 'P_004', 'P_005', 'P_006']) {
  const xml = fs.readFileSync(`assets/reports/_extracted/${p}/document.xml`, 'utf8');
  let text = xml.replace(/<\/w:p>/g, '\n');
  text = text.replace(/<[^>]+>/g, '');
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
  fs.writeFileSync(`assets/reports/_extracted/${p}/prompt.txt`, text);
}
console.log('done');
