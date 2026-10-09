/* @layer renderer-lib @kind logic */
import type { MsuResult } from '@app/ipc/msu-contract';
import { installMsuTracks } from './install-msu-tracks';

const importMsuFile = (pack: string, file: File): Promise<MsuResult> =>
  installMsuTracks(pack, async () => ({ bytes: new Uint8Array(await file.arrayBuffer()), name: file.name }));

export { importMsuFile };
