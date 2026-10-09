/* @layer renderer-stores @kind types */
import type { ConfirmVerb, PauseEvent, PauseState } from '@shared/game/logic/pause';

interface PauseCursorActions {
  confirm: ConfirmVerb | null;
  assign: boolean;
  back: boolean;
}

interface PauseMenuStore {
  state: PauseState;
  dispatch: (event: PauseEvent) => void;
  open: boolean;
  refusals: number;
  canConfirm: boolean;
  cursorActions: PauseCursorActions;
}

export type { PauseCursorActions, PauseMenuStore };
