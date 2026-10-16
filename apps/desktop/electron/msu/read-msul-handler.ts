/* @layer electron-main @kind logic */
import { readFile } from 'fs/promises';
import { handle, toArrayBuffer } from '@drizztdourden08/brock-electron/main';

const registerReadMsulHandler = (): void => {
  handle('msu:readMsulFile', async (_event, filePath: string) => {
    if (!filePath.toLowerCase().endsWith('.msul')) throw new Error('Not a music-pack file');
    return toArrayBuffer(await readFile(filePath));
  });
};

export { registerReadMsulHandler };
