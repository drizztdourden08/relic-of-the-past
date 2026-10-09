/* @layer electron-main @kind logic */
import { handle } from '../../lib/ipc/handle';
import { refusal } from '../refusal';
import { getWorkspaceRoot } from '../workspace-root';
import { writeConnectionPair } from './write-connection-pair';

const registerConnectionPairHandler = (): void => {
  handle('screenEditor:writeConnectionPair', async (_e, args) => {
    try {
      return await writeConnectionPair(getWorkspaceRoot(), args);
    } catch (e: unknown) {
      return refusal(e);
    }
  });
};

export { registerConnectionPairHandler };
