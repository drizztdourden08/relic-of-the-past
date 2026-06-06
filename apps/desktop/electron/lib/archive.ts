/* @layer electron-main @kind logic */
import { join, extname } from 'path';
import { mkdir, readdir, rm } from 'fs/promises';
import { app } from 'electron';
import StreamZip from 'node-stream-zip';

const extractArchiveToTemp = async (archivePath: string): Promise<string> => {
  const tempDir = join(app.getPath('temp'), `archive-extract-${Date.now()}`);
  await mkdir(tempDir, { recursive: true });
  const zip = new StreamZip.async({ file: archivePath });
  try {
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
