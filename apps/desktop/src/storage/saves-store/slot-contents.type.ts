/* @layer renderer-lib @kind types */
import type { MsuResumeState } from '@rotp/game-data';

interface SlotContents {
  bytes: Uint8Array;
  screenshot: Uint8Array | null;
  music: MsuResumeState | null;
}

export type { SlotContents };
