/* @layer shared-game @kind types */
type TextGroupId = 'pause-names' | 'menu' | 'credits' | 'world-names';

type TextLimit =
  | { kind: 'glyphs'; max: number; lines?: number }
  | { kind: 'tiles'; max: number }
  | { kind: 'none' };

type TextSlot = {
  key: string;
  label: string;
  fallback: string;
  limit: TextLimit;
  alphabet: 'pack' | 'latin-caps';
  note?: string;
};

type TextGroup = {
  id: TextGroupId;
  title: string;
  slots: TextSlot[];
  note?: string;
};

type TextOverrides = Partial<Record<TextGroupId, Record<string, string>>>;

type DecodedLine = {
  key: string;
  text: string;
  limit: { kind: 'tiles'; max: number };
};

type DecodedSlotOptions = {
  keyPrefix?: string;
  note?: string;
};

type NamedKind = 'screen' | 'check' | 'item' | 'location' | 'area' | 'dungeon';

type NamedRecord = { id: string; name: string };

type RecordSource = (kind: NamedKind) => readonly NamedRecord[];

type BuildGroupsParams = {
  menu: DecodedLine[];
  credits: DecodedLine[];
  records: RecordSource;
  decodedNote?: string;
};

export type {
  BuildGroupsParams, DecodedLine, DecodedSlotOptions, NamedKind, NamedRecord, RecordSource, TextGroup, TextGroupId,
  TextLimit, TextOverrides, TextSlot,
};
