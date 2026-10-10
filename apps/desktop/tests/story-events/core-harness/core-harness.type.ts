/* @layer test @kind type */
import type { SNES_BUTTON_BITS } from '@rotp/game-data';

type Button = keyof typeof SNES_BUTTON_BITS;

type Step = { hold: readonly Button[]; frames: number };

interface RawCore {
  ccall: (name: string, ret: 'number' | null, types: string[], args: number[]) => number;
  HEAPU8: Uint8Array;
  FS: { mkdir: (path: string) => void; writeFile: (path: string, data: Uint8Array) => void; readFile: (path: string) => Uint8Array };
}

export type { Button, RawCore, Step };
