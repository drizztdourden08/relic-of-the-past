/* @layer renderer-appshell @kind hook */
import { useEffect } from 'react';
import { installMsulFile } from '@app/lib/storage/msu-store';
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
          const result = await installMsulFile(new Uint8Array(buffer), stemOf(filePath));
          log.app(`[MSU] Imported "${result.pack}" with ${result.fileCount} files and ${result.trackCount} slots`);
        } catch (err) {
          log.error(`[MSU] Could not import that pack: ${err instanceof Error ? err.message : err}`);
        }
      })();
    });
    return () => { unsubscribe?.(); };
  }, []);
};

export { useMsulOpen };
