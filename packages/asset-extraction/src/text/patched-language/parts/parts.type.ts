/* @layer shared-asset-extraction @kind types */
import type { GlyphNaming } from '../font';

interface LettersSummary {
  matched: string[];
  built: GlyphNaming[];
  unknown: string[];
  used: number;
}

export type { LettersSummary };
