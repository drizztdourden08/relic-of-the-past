/* @layer renderer-components @kind types */
import type { MsuResumeState } from '@rotp/game-data';

type UndoStep = () => Promise<void> | void;

interface UndoOffer {
  id: string;
  message: string;
  undo: UndoStep;
}

interface GameSnapshot {
  state: ArrayBuffer;
  music: MsuResumeState | null;
}

interface UseUndoableLoadParams {
  isGameRunning: boolean;
  onStartGame: () => void;
}

export type { GameSnapshot, UndoOffer, UndoStep, UseUndoableLoadParams };
