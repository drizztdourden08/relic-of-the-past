/* @layer renderer-lib @kind logic */
import { fetchToBytes } from '@app/download/download';
import type { MsuResult } from '@app/ipc/msu-contract';
import { emitMsuProgress } from './emit-msu-progress';
import { installMsuTracks } from './install-msu-tracks';

const nameFromUrl = (url: string): string => {
  try { return new URL(url).pathname.split('/').pop() || 'pack.zip'; } catch { return 'pack.zip'; }
};

const importMsu = (pack: string, url: string): Promise<MsuResult> =>
  installMsuTracks(pack, async () => ({
    bytes: await fetchToBytes(url, (loaded, total) => emitMsuProgress('download', loaded, total ?? undefined)),
    name: nameFromUrl(url),
  }));

export { importMsu };
