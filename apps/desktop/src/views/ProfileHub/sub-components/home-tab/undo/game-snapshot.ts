/* @layer renderer-components @kind logic */
import { captureStateBuffer, isCoreReady, loadStateFromBuffer } from '@app/game';
import { msuRestore, msuSnapshot } from '@app/game/msu-session';
import { stampStateBuffer } from '@app/game/state-stamp';
import type { GameSnapshot } from './undo.type';

const captureGameSnapshot = async (): Promise<GameSnapshot | null> => {
  if (!isCoreReady()) return null;
  const state = captureStateBuffer();
  return state ? { state: await stampStateBuffer(state), music: msuSnapshot() } : null;
};

const restoreGameSnapshot = ({ state, music }: GameSnapshot): void => {
  if (loadStateFromBuffer(state) && music) msuRestore(music);
};

const gameSnapshot = { capture: captureGameSnapshot, restore: restoreGameSnapshot };

export { gameSnapshot };
