/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { PlayerSheet } from '@shared/game/data/player-sheet/types';
import type { WearingState } from '../../behavior/useWearing';

/** One state with every facing, every state at once, or the raw tile grid. */
type SheetView = 'state' | 'contact' | 'sheet';

type SpriteSheetViewerProps = {
  sheet: PlayerSheet;
  /** Outfit and gloves, when the caller needs them too (the Studio's palette editor does). */
  wearing?: WearingState;
  /** Shown beside the stage, level with it. */
  aside?: ReactNode;
  className?: string;
};

export type { SheetView, SpriteSheetViewerProps };
