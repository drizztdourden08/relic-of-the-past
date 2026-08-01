/* @layer renderer-app @kind data */
import type { EntityKind } from '@shared/game/data';

interface FacetOption {
  value: string;
  label: string;
}

interface FacetConfig {
  /** Property on the raw record this facet filters by. */
  field: string;
  label: string;
  options: FacetOption[];
}

const CONNECTION_KIND_OPTIONS: FacetOption[] = [
  { value: 'edge', label: 'Edge' },
  { value: 'door', label: 'Door' },
  { value: 'entrance', label: 'Entrance' },
  { value: 'stairs', label: 'Stairs' },
  { value: 'hole', label: 'Hole' },
  { value: 'teleport', label: 'Teleport' },
];

const ITEM_ORIGIN_OPTIONS: FacetOption[] = [
  { value: 'vanilla', label: 'Vanilla' },
  { value: 'randomizer', label: 'Randomizer' },
];

const SCREEN_STATUS_OPTIONS: FacetOption[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'mapped', label: 'Mapped' },
  { value: 'verified', label: 'Verified' },
];

const CHECK_KIND_OPTIONS: FacetOption[] = [
  { value: 'chest', label: 'Chest' },
  { value: 'npc', label: 'NPC' },
  { value: 'standing', label: 'Standing' },
  { value: 'boss', label: 'Boss' },
  { value: 'prize', label: 'Prize' },
  { value: 'keyDrop', label: 'Key Drop' },
  { value: 'potItem', label: 'Pot Item' },
  { value: 'dig', label: 'Dig' },
  { value: 'bonk', label: 'Bonk' },
  { value: 'event', label: 'Event' },
];

const ACTOR_KIND_OPTIONS: FacetOption[] = [
  { value: 'enemy', label: 'Enemy' },
  { value: 'boss', label: 'Boss' },
  { value: 'npc', label: 'NPC' },
  { value: 'object', label: 'Object' },
  { value: 'obstacle', label: 'Obstacle' },
  { value: 'trigger', label: 'Trigger' },
];

/** The one extra, kind-specific filter dimension worth a dedicated control — everything else stays in free text. */
const FACETS: Partial<Record<EntityKind, FacetConfig>> = {
  screen: { field: 'status', label: 'Status', options: SCREEN_STATUS_OPTIONS },
  connection: { field: 'kind', label: 'Kind', options: CONNECTION_KIND_OPTIONS },
  check: { field: 'kind', label: 'Kind', options: CHECK_KIND_OPTIONS },
  item: { field: 'origin', label: 'Origin', options: ITEM_ORIGIN_OPTIONS },
  actor: { field: 'kind', label: 'Kind', options: ACTOR_KIND_OPTIONS },
};

export { FACETS };
export type { FacetConfig, FacetOption };
