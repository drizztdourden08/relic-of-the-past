/* @layer renderer-components @kind hook */
/**
 * Export as `.msul` (whole) or MSU-1 (flattened, playable elsewhere). MSU-1 decodes through an
 * OfflineAudioContext: an ordinary context would hold the sound card open for the whole export.
 */
import { useCallback, useState } from 'react';
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { exportMsulPack } from '@app/lib/msu/export/export-msul';
import { exportMsu1Pack } from '@app/lib/msu/export/export-msu1';
import { decodeAudioFile } from '@app/lib/msu/decode/decode-audio-file';
import { listMsuPackEntries, readMsuTrackFile } from '@app/lib/storage/msu-store';
import { saveBytesAsFile } from './save-bytes';
import { failure } from './usePackList';
import type { ActionResult } from '../msu.type';

type ExportFormat = 'msul' | 'msu1';

const usePackExport = (pack: string | null, manifest: MsuPackManifest) => {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const loadBytes = useCallback(async (fileName: string): Promise<Uint8Array | null> => {
    if (!pack) return null;
    try { return new Uint8Array(await readMsuTrackFile(pack, fileName)); } catch { return null; }
  }, [pack]);

  const runExport = useCallback(async (format: ExportFormat): Promise<ActionResult> => {
    if (!pack) return { success: false, message: 'No pack selected' };
    setExporting(format);
    setProgress(null);
    try {
      if (format === 'msul') {
        // Read at export time, not from the studio's copy: the archive is the folder as it is now.
        const bytes = await exportMsulPack({
          manifest,
          fileNames: await listMsuPackEntries(pack),
          loadBytes,
          onProgress: (p) => setProgress(`Packing ${p.fileName} (${p.done}/${p.total})`),
        });
        saveBytesAsFile(`${pack}.msul`, bytes);
        return { success: true, message: `Exported "${pack}.msul" with layering intact` };
      }

      const decoder = new OfflineAudioContext(2, 1, 44100);
      const bytes = await exportMsu1Pack({
        manifest,
        baseName: pack,
        loadBuffer: async (fileName) => {
          const raw = await loadBytes(fileName);
          if (!raw) return null;
          try { return (await decodeAudioFile(decoder, fileName, raw)).buffer; } catch { return null; }
        },
        onProgress: (p) => setProgress(`Flattening slot ${p.trackNum} (${p.done}/${p.total})`),
      });
      saveBytesAsFile(`${pack}-msu1.zip`, bytes);
      return { success: true, message: `Exported "${pack}-msu1.zip" with layers flattened for MSU-1 players` };
    } catch (err) {
      return failure(err, 'Export failed');
    } finally {
      setExporting(null);
      setProgress(null);
    }
  }, [pack, manifest, loadBytes]);

  return { exporting, exportProgress: progress, runExport };
};

export { usePackExport };
export type { ExportFormat };
