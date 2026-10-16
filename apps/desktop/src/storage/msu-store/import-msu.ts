/* @layer renderer-lib @kind logic */
import { fetchToBytes } from '@app/download/download';
import type { MsuResult } from '@app/ipc/msu-contract';
import { lastPathSegment } from '../last-path-segment';
import { installMsuTracks } from './install-msu-tracks';

const nameFromUrl = (url: string): string => lastPathSegment(url) || 'pack.zip';

const importMsu = (pack: string, url: string): Promise<MsuResult> =>
  installMsuTracks(pack, async (report) => ({
    bytes: await fetchToBytes(url, (loaded, total) => report.count('download', loaded, total ?? undefined)),
    name: nameFromUrl(url),
  }));

export { importMsu };
