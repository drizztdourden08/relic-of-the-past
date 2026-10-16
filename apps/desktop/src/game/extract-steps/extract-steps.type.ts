/* @layer bridge-wasm @kind types */
import type { SpriteDef } from '@rotp/asset-extraction';
import type { SetBakeInput } from '@rotp/languages';
import type { SupplementRoms } from '../../storage/asset-files';

type ExtractStepId = 'assets' | 'language' | 'menu-text' | 'sprites';

interface ExtractData {
  romBytes: Uint8Array;
}

interface ExtractInputs {
  assets: { supplementRoms: SupplementRoms; languages: SetBakeInput[] };
  language: undefined;
  'menu-text': undefined;
  sprites: { defs: SpriteDef[] };
}

export type { ExtractData, ExtractInputs, ExtractStepId };
