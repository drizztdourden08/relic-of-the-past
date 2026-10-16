/* @layer renderer-components @kind types */
import type { MsuResumeState } from '@rotp/game-data';
import type { SaveRowNoticeKind } from '@app/compounds/SaveRow';

type UndoStep = () => Promise<void> | void;

interface UndoOffer {
  key: string;
  kind: SaveRowNoticeKind;
  undo?: UndoStep;
  commit?: UndoStep;
}

interface LiveUndo extends UndoOffer {
  timer: ReturnType<typeof setTimeout>;
}

type UndoNotices = Readonly<Record<string, SaveRowNoticeKind>>;

interface UndoWindow {
  notices: UndoNotices;
  offer: (offer: UndoOffer) => void;
  undo: (key: string) => void;
  undoLatest: () => void;
}

type SaveListKind = 'normal' | 'auto' | 'quick';

interface GameSnapshot {
  state: ArrayBuffer;
  music: MsuResumeState | null;
}

interface UseUndoableLoadParams {
  isGameRunning: boolean;
  onStartGame: () => void;
  undo: UndoWindow;
}

export type { GameSnapshot, LiveUndo, SaveListKind, UndoNotices, UndoOffer, UndoStep, UndoWindow, UseUndoableLoadParams };
