/* @layer renderer-widgets @kind logic */
/** Static option lists + id/slug helpers for the ScreenEditorDialog wizard. */
import type { SelectOption, SegmentOption, TagPickerGroup } from '../../../components/primitives';
import type { ScreenType, InteriorKind } from '@shared/game/types';
import type { ScreenTag } from '@shared/game/data/screens/tags';
import { TAG_METADATA, TAG_NAMESPACES } from '@shared/game/data/screens/tags';
import { PALACE_INDEX_NAMES } from '@shared/game/data/screens/game-values';

const TYPE_SEGMENTS: SegmentOption<ScreenType>[] = [
  { value: 'overworld', label: 'Overworld' },
  { value: 'dungeon', label: 'Dungeon' },
  { value: 'interior', label: 'Interior' },
];

const WORLD_SEGMENTS: SegmentOption<'light' | 'dark'>[] = [
  { value: 'light', label: 'Light World' },
  { value: 'dark', label: 'Dark World' },
];

const PALACE_OPTIONS: SelectOption[] = Object.entries(PALACE_INDEX_NAMES)
  .filter(([k]) => Number(k) !== 0xFF)
  .map(([value, label]) => ({ value, label: `0x${Number(value).toString(16).toUpperCase().padStart(2, '0')} — ${label}` }));

const INTERIOR_KIND_VALUES: InteriorKind[] = ['cave', 'house', 'shop', 'fairy', 'well', 'passage', 'hint', 'gamble', 'special'];
const INTERIOR_KIND_OPTIONS: SelectOption[] = INTERIOR_KIND_VALUES.map(k => ({
  value: k,
  label: k.charAt(0).toUpperCase() + k.slice(1),
}));

const CONDITION_TYPE_OPTIONS: SelectOption[] = [
  { value: 'always', label: 'Always (default fallback)' },
  { value: 'check', label: 'Tracker Check' },
  { value: 'flag', label: 'WRAM Flag' },
  { value: 'entrance', label: 'Entrance Used' },
  { value: 'progress', label: 'Progress Tier' },
];

/** Pre-built tag groups for the TagPicker */
const TAG_GROUPS: TagPickerGroup<ScreenTag>[] = TAG_NAMESPACES.map(ns => ({
  id: ns.id,
  label: ns.label,
  options: TAG_METADATA.filter(t => t.namespace === ns.id).map(t => ({ value: t.id, label: t.label })),
}));

const getDungeonPrefix = (palaceIndex: number): string => {
  const map: Record<number, string> = {
    0x00: 'hc', 0x02: 'hc', 0x04: 'ep', 0x06: 'dp', 0x08: 'th',
    0x0A: 'pod', 0x0C: 'sp', 0x0E: 'sw', 0x10: 'tt',
    0x12: 'ip', 0x14: 'mm', 0x16: 'tr', 0x18: 'gt', 0x1A: 'ct',
  };
  return map[palaceIndex] ?? 'room';
};

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export {
  TYPE_SEGMENTS, WORLD_SEGMENTS, PALACE_OPTIONS, INTERIOR_KIND_OPTIONS,
  CONDITION_TYPE_OPTIONS, TAG_GROUPS, getDungeonPrefix, slugify,
};
