/* @layer shared-storage @kind logic */
import JSZip from 'jszip';
import type { ArchiveEntry } from './archive.type';

const unzip = async (bytes: Uint8Array): Promise<ArchiveEntry[]> => {
  const zip = await JSZip.loadAsync(bytes);
  const out: ArchiveEntry[] = [];
  for (const entry of Object.values(zip.files)) {
    if (entry.dir) continue;
    out.push({ name: entry.name.split('/').pop() ?? entry.name, bytes: await entry.async('uint8array') });
  }
  return out;
};

export { unzip };
