/* @layer renderer-components @kind constants */
import type { GbaGroup } from '@rotp/features';
import type { EvidenceFilter, GbaAvailability } from './gba-settings.type';

const EVIDENCE_OPTIONS: { value: EvidenceFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'extracted', label: 'Extracted only' },
];

const EXTRA_DUNGEON_DESCRIPTION = 'Adds the optional post-game dungeon and its overworld entrance. Requires the second cartridge.';

const GBA_GROUP_ORDER: GbaGroup[] = [
  'Extra content',
  'Combat & items',
  'World & exploration',
  'Enemies & bosses',
  'Presentation',
  'Audio & voice',
  'Text & naming',
  'Save & meta',
  'Fixes',
  'Removed',
];

const NO_SUPPLEMENT: GbaAvailability = { hasSupplement: false, supplementFile: null };

export { EVIDENCE_OPTIONS, EXTRA_DUNGEON_DESCRIPTION, GBA_GROUP_ORDER, NO_SUPPLEMENT };
