/* @layer tooling-scripts @kind logic */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';
import { FIXED_DATE, SKIPPED, TEXT_EXTENSIONS } from './apworld.constants.mjs';

const UNIX_FILE_MODE = 0o100644;

/** Every file under a folder as a path relative to it, caches left out, in a fixed order. */
const packageFiles = (dir, prefix = '') => readdirSync(dir).sort().flatMap((name) => {
  if (SKIPPED.has(name)) return [];
  const rel = prefix === '' ? name : `${prefix}/${name}`;
  return statSync(path.join(dir, name)).isDirectory() ? packageFiles(path.join(dir, name), rel) : [rel];
});

/** A text file with LF line endings whatever the checkout used, so the bytes match on every machine. */
const bytesOf = (sourceDir, rel) => {
  const bytes = readFileSync(path.join(sourceDir, rel));
  if (!TEXT_EXTENSIONS.has(path.extname(rel))) return bytes;
  return Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
};

/**
 * The source folder as a zip with the module folder at its root, as Archipelago requires.
 * Entries are sorted, dated, permissioned and compressed the same way every time.
 */
const zipPackage = async ({ sourceDir, moduleName }) => {
  const zip = new JSZip();
  for (const rel of packageFiles(sourceDir)) {
    zip.file(`${moduleName}/${rel}`, bytesOf(sourceDir, rel), { date: FIXED_DATE, createFolders: false, unixPermissions: UNIX_FILE_MODE });
  }
  return zip.generateAsync({
    type: 'nodebuffer',
    platform: 'UNIX',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
};

export { zipPackage };
