/* @layer renderer-lib @kind types */
import type { PoseFrame } from '@shared/game/data/native-tables/player-pose-atlas.type';
import type { PlayerSheet } from '@shared/game/data/player-sheet/types';
import type { ResolvedRow } from './resolve-palette';

interface ComposeArgs {
  dest: Uint32Array;
  destWidth: number;
  destHeight: number;
  sheet: PlayerSheet;
  row: ResolvedRow;
  frame: PoseFrame;
  originX: number;
  originY: number;
}

export type { ComposeArgs };
