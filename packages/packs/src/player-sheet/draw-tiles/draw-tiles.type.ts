/* @layer renderer-lib @kind types */
import type { ResolvedRow } from '../resolve-palette';

interface BlitArgs {
  dest: Uint32Array;
  destWidth: number;
  destHeight: number;
  pixels: Uint8Array;
  row: ResolvedRow;
  offset: number;
  cols: number;
  rows: number;
  x: number;
  y: number;
  flipX?: boolean;
  flipY?: boolean;
}

export type { BlitArgs };
