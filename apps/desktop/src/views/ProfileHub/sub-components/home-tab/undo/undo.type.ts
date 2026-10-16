/* @layer renderer-components @kind types */
import type { MsuResumeState } from '@rotp/game-data';

type UndoStep = () => Promise<void> | void;

interface GameSnapshot {
  state: ArrayBuffer;
  music: MsuResumeState | null;
}

interface UseUndoableLoadParams {
  isGameRunning: boolean;
  onStartGame: () => void;
}

export type { GameSnapshot, UndoStep, UseUndoableLoadParams };
