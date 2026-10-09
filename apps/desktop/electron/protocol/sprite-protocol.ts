/* @layer electron-main @kind logic */
import { net, protocol } from 'electron';
import { getUserDataPath } from '../lib/paths';
import { spriteFileUrlOf } from './sprite-file-path';

const registerSpriteProtocol = (): void => {
  protocol.handle('app-sprite', (request) => net.fetch(spriteFileUrlOf(getUserDataPath('sprites'), request.url)));
};

export { registerSpriteProtocol };
