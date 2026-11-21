/* @layer bridge-wasm @kind types */
import type {
  FontReference, PatchedPartReport, RomLanguage, ScreenPayload, SpriteDef,
} from '@rotp/asset-extraction';
import type { SetBakeInput } from '@rotp/languages';
import type { SupplementRoms } from '../../storage/asset-files';

type ExtractStepId = 'assets' | 'japanese-graphics' | 'language' | 'menu-text' | 'patched-language' | 'sprites';

interface ExtractData {
  romBytes: Uint8Array;
}

interface PatchedLanguageStepInput {
  base: RomLanguage;
  libraryRoms: Uint8Array[];
  references: FontReference[];
}

interface PatchedLanguageOutput {
  success: boolean;
  parts: PatchedPartReport[];
  description: string;
  dialogue: string;
  glyphCount: number;
  lineCount: number;
  encoder: 'org' | 'new';
  flags: number;
  menu: Record<string, string>;
  credits: Record<string, string>;
  screens: ScreenPayload | null;
}

interface ExtractInputs {
  assets: { supplementRoms: SupplementRoms; languages: SetBakeInput[] };
  'japanese-graphics': undefined;
  language: undefined;
  'menu-text': undefined;
  'patched-language': PatchedLanguageStepInput;
  sprites: { defs: SpriteDef[] };
}

export type { ExtractData, ExtractInputs, ExtractStepId, PatchedLanguageOutput };
