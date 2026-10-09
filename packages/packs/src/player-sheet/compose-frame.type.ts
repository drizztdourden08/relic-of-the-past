/* @layer renderer-lib @kind types */
import type { PoseFrame, PlayerSheet } from '@rotp/game-data';
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
