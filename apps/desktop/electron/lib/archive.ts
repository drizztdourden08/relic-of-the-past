/* @layer electron-main @kind logic */
import { join, extname } from 'path';
import { mkdir, readdir, rm } from 'fs/promises';
import { app } from 'electron';
import StreamZip from 'node-stream-zip';

/** Reports number of entries extracted so far; `total` is the entry count. */
type ExtractProgress = (extracted: number, total?: number) => void;

const extractArchiveToTemp = async (archivePath: string, onProgress?: ExtractProgress): Promise<string> => {
  const tempDir = join(app.getPath('temp'), `archive-extract-${Date.now()}`);
  await mkdir(tempDir, { recursive: true });
  const zip = new StreamZip.async({ file: archivePath });
  try {
    if (onProgress) {
      let total: number | undefined;
      try { total = await zip.entriesCount; } catch { /* entry count unavailable */ }
      let extracted = 0;
      zip.on('extract', () => { extracted += 1; onProgress(extracted, total); });
    }
    await zip.extract(null, tempDir);
  } finally {
    await zip.close();
  }
  return tempDir;
};

const walkFiles = async (dir: string, extensions?: Set<string>): Promise<string[]> => {
  const found: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...await walkFiles(full, extensions));
    } else if (!extensions || extensions.has(extname(entry.name).toLowerCase())) {
      found.push(full);
    }
  }
  return found;
};

/**
 * Extract only the entries whose BASENAME is wanted, straight into `destDir` — the rest
 * of the archive is never inflated. Used for tool archives, where a few hundred MB of
 * docs and extra executables sit beside the two binaries we keep. Returns what was
 * written, so a caller can tell a partial archive from a complete one.
 */
const extractEntriesByBasename = async (
  archivePath: string, wanted: Set<string>, destDir: string,
): Promise<string[]> => {
  await mkdir(destDir, { recursive: true });
  const zip = new StreamZip.async({ file: archivePath });
  const written: string[] = [];
  try {
    for (const entry of Object.values(await zip.entries())) {
      if (entry.isDirectory) continue;
      const base = entry.name.split('/').pop() ?? entry.name;
      if (!wanted.has(base.toLowerCase())) continue;
      const dest = join(destDir, base);
      await zip.extract(entry.name, dest);
      written.push(dest);
    }
  } finally {
    await zip.close();
  }
  return written;
};

export { extractArchiveToTemp, extractEntriesByBasename, walkFiles };
export type { ExtractProgress };
