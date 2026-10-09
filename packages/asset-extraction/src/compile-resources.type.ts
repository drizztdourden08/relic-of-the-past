/* @layer shared-asset-extraction @kind types */
import type { PackedLangEntry } from './text/build-language-entry';

interface CompileOptions {
  skipDialogue?: boolean;
  skipMusic?: boolean;
  extraLanguages?: PackedLangEntry[];
}

export type { CompileOptions };
