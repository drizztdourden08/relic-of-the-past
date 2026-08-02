/* @layer renderer-widgets @kind logic */
/** Static option lists for the ScreenEditorDialog wizard. */
import type { SelectOption, SegmentOption, TagPickerGroup } from '../../../../design-system/primitives';
import type { InteriorKind, ScreenKind, ScreenTag } from '@shared/game/data';
import { enumerationFor, TAG_METADATA, TAG_NAMESPACES } from '@shared/game/data';
import { PALACE_INDEX_NAMES } from '@shared/game/logic/queries/dungeon-values';

/** Sourced from Enumeration rather than hardcoded, so a segment label can't drift from the canonical one. */
const TYPE_SEGMENTS: SegmentOption<ScreenKind>[] = enumerationFor('screen-kind')
  .map(entry => ({ value: entry.value as ScreenKind, label: entry.label }));

// 'both' is a real `world` value (an overworld screen occupying the same tile
// in either world) but this wizard's world picker is light/dark only, so it's
// filtered out here rather than added as a third, meaningless segment.
const WORLD_SEGMENTS: SegmentOption<'light' | 'dark'>[] = enumerationFor('world')
  .filter(entry => entry.value !== 'both')
  .map(entry => ({ value: entry.value as 'light' | 'dark', label: entry.label }));

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
