/**
 * Standalone sprite extraction script.
 * Usage: npx tsx scripts/extract-sprites.ts [rom-path] [output-dir]
 *
 * Defaults:
 *   rom: test-roms/Legend of Zelda, The - A Link to the Past (USA).sfc
 *   output: apps/desktop/public/sprites/items/
 */
import { join } from 'path';
import { extractAllItemSprites } from '../shared/asset-extraction/item-sprites/extract-items';

const root = join(__dirname, '..');
const romPath = process.argv[2] || join(root, 'test-roms', 'Legend of Zelda, The - A Link to the Past (USA).sfc');
const outputDir = process.argv[3] || join(root, 'apps', 'desktop', 'public', 'sprites', 'items');

console.log(`Extracting sprites...`);
console.log(`  ROM: ${romPath}`);
console.log(`  Output: ${outputDir}`);

const result = extractAllItemSprites(romPath, outputDir);

console.log(`\nDone! ${result.total} sprites extracted.`);
if (result.errors.length > 0) {
  console.log(`Errors (${result.errors.length}):`);
  result.errors.forEach(e => console.log(`  - ${e}`));
}
if (result.removedStale > 0) {
  console.log(`Removed ${result.removedStale} stale files.`);
}

// Category breakdown
const cats = result.categories ?? {};
for (const [cat, count] of Object.entries(cats)) {
  console.log(`  ${cat}: ${count}`);
}
