/* @layer electron-main @kind logic */
import { join } from 'path';
import { mkdir } from 'fs/promises';
import StreamZip from 'node-stream-zip';

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

export { extractEntriesByBasename };
