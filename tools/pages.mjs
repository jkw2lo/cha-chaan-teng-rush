// Writes one page per restaurant from game.html, so each gets a clean address (/cct/, /dimsum/).
//   node tools/pages.mjs
import { readFile, writeFile, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const GAMES = ['cct', 'dimsum'];
const template = await readFile(ROOT + 'game.html', 'utf8');

for (const id of GAMES){
  const page = template
    .replace('<html lang="en">', `<html lang="en" data-game="${id}">`)
    .replace('<!-- The game page. tools/pages.mjs copies it to cct/index.html and dimsum/index.html; edit this one. -->',
             '<!-- Generated from game.html by tools/pages.mjs. Edit game.html, then run: node tools/pages.mjs -->')
    .replaceAll('href="css/', 'href="../css/')
    .replaceAll('src="js/', 'src="../js/');
  await mkdir(ROOT + id, { recursive: true });
  await writeFile(`${ROOT}${id}/index.html`, page);
  console.log(`wrote ${id}/index.html`);
}
