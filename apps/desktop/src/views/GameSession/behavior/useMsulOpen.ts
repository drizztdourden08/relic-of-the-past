/* @layer renderer-appshell @kind hook */
import { useCallback } from 'react';
import type { OpenRequest } from '@drizztdourden08/brock-core';
import { useAppOpen } from '@drizztdourden08/brock-react';
import { appApi } from '@app/ipc/app-api';
import { installMsulFile } from '@app/lib/storage/msu-store';
import { log } from '@app/lib/log-bus';

const stemOf = (filePath: string): string =>
  (filePath.split(/[\\/]/).pop() ?? '').replace(/\.msul$/i, '');

const importPack = async (filePath: string): Promise<void> => {
  log.app(`[MSU] Opening pack file ${filePath}`);
  try {
    const buffer = await appApi().readMsulFile(filePath);
    const result = await installMsulFile(new Uint8Array(buffer), stemOf(filePath));
    log.app(`[MSU] Imported "${result.pack}" with ${result.fileCount} files and ${result.trackCount} slots`);
  } catch (err) {
    log.error(`[MSU] Could not import that pack: ${err instanceof Error ? err.message : String(err)}`);
  }
};

const useMsulOpen = (): void => {
  const handleOpen = useCallback((request: OpenRequest) => {
    if (request.kind === 'file' && request.ext === 'msul') void importPack(request.path);
  }, []);
  useAppOpen(handleOpen);
};

export { useMsulOpen };
