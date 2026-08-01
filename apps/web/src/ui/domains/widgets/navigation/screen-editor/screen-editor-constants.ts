/* @layer renderer-widgets @kind logic */
/** Static option lists for the ScreenEditorDialog wizard. */
import type { SelectOption, SegmentOption, TagPickerGroup } from '../../../../design-system/primitives';
import type { InteriorKind, ScreenKind, ScreenTag } from '@shared/game/data';
import { TAG_METADATA, TAG_NAMESPACES } from '@shared/game/data';
import { PALACE_INDEX_NAMES } from '@shared/game/logic/queries/dungeon-values';

const TYPE_SEGMENTS: SegmentOption<ScreenKind>[] = [
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

export {
  TYPE_SEGMENTS, WORLD_SEGMENTS, PALACE_OPTIONS, INTERIOR_KIND_OPTIONS,
  CONDITION_TYPE_OPTIONS, TAG_GROUPS,
};
