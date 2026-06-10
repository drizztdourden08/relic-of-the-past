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

export { extractArchiveToTemp, walkFiles };
export type { ExtractProgress };
