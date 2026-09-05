/* @layer shared-storage @kind logic */
/** ZIP extraction via jszip (pure JS), replacing node-stream-zip on every platform. */
import JSZip from 'jszip';

interface ArchiveEntry {
  name: string; // basename
  bytes: Uint8Array;
}

// ZIP magic 'PK\x03\x04' (also covers empty-archive 'PK\x05\x06').
const isZip = (bytes: Uint8Array): boolean => bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b;

const unzip = async (bytes: Uint8Array): Promise<ArchiveEntry[]> => {
  const zip = await JSZip.loadAsync(bytes);
  const out: ArchiveEntry[] = [];
  for (const entry of Object.values(zip.files)) {
    if (entry.dir) continue;
    out.push({ name: entry.name.split('/').pop() ?? entry.name, bytes: await entry.async('uint8array') });
  }
  return out;
};

export { isZip, unzip };
export type { ArchiveEntry };
