/* @layer renderer-appshell @kind hook */
/**
 * Imports a music pack the app was opened with, from the desktop file association.
 *
 * The main process reports the path (msu:openPack); reading it needs a trip back through IPC
 * because the renderer cannot open an arbitrary path itself. The import is the same one the
 * Data Manager performs, so an opened pack and a dropped pack land identically.
 */
import { useEffect } from 'react';
import { installMsulPack } from '@app/lib/msu/import/install-msul-pack';
import { log } from '../../lib/log-bus';

const stemOf = (filePath: string): string =>
  (filePath.split(/[\\/]/).pop() ?? '').replace(/\.msul$/i, '');

const useMsulOpen = (): void => {
  useEffect(() => {
    const unsubscribe = window.api.onMsuOpenPack?.((filePath: string) => {
      void (async () => {
        log.app(`[MSU] Opening pack file ${filePath}`);
        try {
          const buffer = await window.api.readMsulFile(filePath);
          const result = await installMsulPack(new Uint8Array(buffer), stemOf(filePath));
          log.app(`[MSU] Imported "${result.pack}" — ${result.fileCount} files, ${result.trackCount} slots`);
        } catch (err) {
          log.error(`[MSU] Could not import that pack: ${err instanceof Error ? err.message : err}`);
        }
      })();
    });
    return () => { unsubscribe?.(); };
  }, []);
};

export { useMsulOpen };
