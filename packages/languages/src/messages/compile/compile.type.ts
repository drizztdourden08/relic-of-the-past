/* @layer shared-game @kind types */
import type { LanguageSet } from '../types';

type SetFont = {
  fontData: Buffer;
  fontWidth: Buffer;
};

type SetBakeInput = {
  set: LanguageSet;
  fontData: Uint8Array;
  fontWidth: Uint8Array;
};

export type { SetBakeInput, SetFont };
