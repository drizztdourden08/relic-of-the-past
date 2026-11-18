/* @layer electron-main @kind logic */
import { readFile } from 'fs/promises';
import { msg } from '@drizztdourden08/brock-core/i18n';
import { mainText } from '../lib/main-text';
import { handle, toArrayBuffer } from '@drizztdourden08/brock-electron/main';

const registerReadMsulHandler = (): void => {
  handle('msu:readMsulFile', async (_event, filePath: string) => {
    if (!filePath.toLowerCase().endsWith('.msul')) throw new Error(mainText(msg('main:msu.notPack')));
    return toArrayBuffer(await readFile(filePath));
  });
};

export { registerReadMsulHandler };
