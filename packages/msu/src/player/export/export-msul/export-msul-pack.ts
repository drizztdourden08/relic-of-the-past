/* @layer renderer-lib @kind logic */
import type { MsuPackManifest } from '@rotp/game-data';
import { MSUL_MANIFEST_NAME } from '@rotp/hub-contracts';
import { zipEntries } from '@rotp/roms';
import type { ZipEntry } from '@rotp/roms';
import { dedupeByContent } from '../dedupe-files';
import { referencedFiles, remapManifestFiles } from '../remap-manifest';
import type { ExportMsulParams } from './export-msul.type';
import { serializeForExport } from './serialize-for-export';

const namesToStore = (manifest: MsuPackManifest, fileNames: string[]): string[] => {
  const referenced = referencedFiles(manifest);
  const seen = new Set(referenced);
  return [...referenced, ...fileNames.filter((name) => !seen.has(name))];
};

const exportMsulPack = async (params: ExportMsulParams): Promise<Uint8Array> => {
  const { manifest, fileNames, loadBytes, onProgress } = params;

  const { entries: files, canonical } = await dedupeByContent(namesToStore(manifest, fileNames), loadBytes);

  const stored: MsuPackManifest = {
    ...remapManifestFiles(manifest, canonical),
    files: files.map((file) => file.name).sort((a, b) => a.localeCompare(b)),
  };

  const entries: ZipEntry[] = [
    { name: MSUL_MANIFEST_NAME, bytes: serializeForExport(stored), store: false },
  ];
  for (const [index, file] of files.entries()) {
    entries.push({ name: file.name, bytes: file.bytes });
    onProgress?.({ fileName: file.name, done: index + 1, total: files.length });
  }

  return zipEntries(entries, { store: true });
};

export { exportMsulPack };
