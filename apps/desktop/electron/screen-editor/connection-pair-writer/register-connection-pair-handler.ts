/* @layer electron-main @kind logic */
import { handle } from '@drizztdourden08/brock-electron/main';
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
