/* @layer renderer-lib @kind logic */
/**
 * Exports a pack as `.msul` — our own container, and the only format that keeps a pack whole:
 * layers, play modes, per-layer volumes, loop points and pack metadata all survive it.
 *
 * It is deliberately a plain ZIP under a different extension. A user can rename it to `.zip`,
 * open it, and see a readable `pack.json` beside the audio, which makes the format inspectable
 * without our app and keeps us honest about what a pack contains.
 *
 * Two layout rules:
 * - `pack.json` is the FIRST entry, so a reader can identify a pack from the head of the file
 *   instead of scanning gigabytes of audio. It is also the one entry worth DEFLATE-ing.
 * - Audio is STORE-d. Compressed audio does not deflate, and raw PCM barely does.
 */
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { MSUL_MANIFEST_NAME } from '@shared/types/msu-manifest';
import { zipEntries } from '@shared/storage/archive-write';
import type { ZipEntry } from '@shared/storage/archive-write';
import { dedupeByContent } from './dedupe-files';
import type { LoadBytes } from './dedupe-files';
import { referencedFiles, remapManifestFiles } from './remap-manifest';

interface MsulExportProgress {
  /** The file just added. */
  fileName: string;
  done: number;
  total: number;
}

interface ExportMsulParams {
  manifest: MsuPackManifest;
  /** Reads one file named by the manifest. null means missing, and aborts the export. */
  loadBytes: LoadBytes;
  onProgress?: (progress: MsulExportProgress) => void;
}

/**
 * Written by hand rather than through storage's serializeManifest, which stamps `modifiedAt`
 * with the current time. Export must be reproducible and lossless, so the manifest goes out
 * exactly as it came in.
 */
const serializeForExport = (manifest: MsuPackManifest): Uint8Array =>
  new TextEncoder().encode(`${JSON.stringify(manifest, null, 2)}\n`);

const exportMsulPack = async (params: ExportMsulParams): Promise<Uint8Array> => {
  const { manifest, loadBytes, onProgress } = params;

  // TODO(opus): a later pass transcodes here — per-layer Opus presets (bitrate/channels chosen
  // per layer kind: full bitrate for a music body, a low-bitrate mono for an ambient one) would
  // slot in between dedupe and entry construction, replacing `bytes` and the file extension.
  // Dedupe has to stay ahead of it so identical sources are encoded once, and the encoded name
  // then feeds the same `canonical` map, which keeps the manifest rewrite below unchanged.
  const { entries: files, canonical } = await dedupeByContent(referencedFiles(manifest), loadBytes);

  // Rewriting through the very map dedupe produced is what keeps the manifest resolvable: a
  // reference to a dropped duplicate now names the copy that was actually stored.
  const stored = remapManifestFiles(manifest, canonical);

  const entries: ZipEntry[] = [
    { name: MSUL_MANIFEST_NAME, bytes: serializeForExport(stored), store: false },
  ];
  for (const [index, file] of files.entries()) {
    entries.push({ name: file.name, bytes: file.bytes });
    onProgress?.({ fileName: file.name, done: index + 1, total: files.length });
  }

  return zipEntries(entries, { store: true });
};

export { exportMsulPack, serializeForExport };
export type { ExportMsulParams, MsulExportProgress };
