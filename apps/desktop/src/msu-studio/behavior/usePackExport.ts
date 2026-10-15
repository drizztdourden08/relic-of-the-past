/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import type { MsuPackManifest } from '@rotp/game-data';
import { exportMsulPack, exportMsu1Pack, decodeAudioFile } from '@rotp/msu';
import { listMsuPackEntries, readMsuTrackFile } from '@app/storage/msu-store';
import { saveBytesAsFile } from './save-bytes';
import { failure } from './failure';
import type { ActionResult } from '../msu.type';
import type { ExportFormat } from './pack-export.type';

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
