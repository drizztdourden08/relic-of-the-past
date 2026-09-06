/* @layer electron-main @kind logic */
/**
 * Serves `app-sprite://sprites/<romStem>/<file>.png` from the data root's
 * `sprites/` folder, the same root the renderer's FileStore lists when it
 * checks whether a set is extracted, so a `--user-data` override moves both
 * together.
 */
import { net, protocol } from 'electron';
import { getUserDataPath } from '../lib/paths';
import { spriteFileUrlOf } from './sprite-file-path';

const registerSpriteProtocol = (): void => {
  protocol.handle('app-sprite', (request) => net.fetch(spriteFileUrlOf(getUserDataPath('sprites'), request.url)));
};

export { registerSpriteProtocol };
