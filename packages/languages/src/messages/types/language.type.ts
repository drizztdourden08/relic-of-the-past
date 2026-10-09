/* @layer shared-game @kind types */
import type { BasedOn } from '@rotp/game-data';
import type { TextOverrides } from '../text/types';
import type { Variable } from '../variables/types';

type Token =
  | { t: 'text'; v: string }
  | { t: 'cmd'; name: string; param?: number }
  | { t: 'break'; row: 1 | 2 | 3 }
  | { t: 'var'; name: 'player-name' | 'number'; slot?: number }
  | { t: 'ref'; key: string };

type DialogueEntry = {
  id: number;
  tokens: Token[];
  note?: string;
};

type GlossaryTerm = {
  key: string;
  value: string;
  note?: string;
};

type PauseLabelKey = 'item' | 'equipment' | 'dungeon-item' | 'crystals' | 'pendants' | 'do';

type NameTable = {
  items: Record<string, string>;
  bottles: Record<number, string>;
  labels: Record<PauseLabelKey, string>;
};

type LanguageSetMeta = {
  id: string;
  name: string;
  base: string;
  origin: 'rom' | 'custom';
  version: number;
  author?: string;
  basedOn?: BasedOn;
};

type SetStructure = 'continuous' | 'block' | 'off';

type LanguageSet = LanguageSetMeta & {
  dialogue: DialogueEntry[];
  glossary: GlossaryTerm[];
  names: NameTable;
  variables?: Variable[];
  structure?: SetStructure;
  text?: TextOverrides;
};

export type {
  DialogueEntry, GlossaryTerm, LanguageSet, LanguageSetMeta, NameTable, PauseLabelKey,
  SetStructure, Token,
};
