/* @layer renderer-components @kind constants */
import type { GbaGroup } from '@rotp/features';
import type { StatusMap } from '@drizztdourden08/tessera/primitives';
import type { EvidenceFilter, GbaAvailability } from './gba-settings.type';

const EVIDENCE_OPTIONS: { value: EvidenceFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'in-progress', label: 'In progress only' },
];

const EVIDENCE_STATUS = {
  'in-progress': { label: 'In progress', tone: 'info' },
  documented: { label: 'Documented', tone: 'neutral' },
} as const satisfies StatusMap;

const EXPERIMENTAL_NOTICE = 'Experimental and unfinished. Expect missing pieces and bugs.';

const TRACKER_NOTE = 'What the Game Boy Advance release changes and how far each part has got. None of it can be switched on or off yet.';

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

export { EVIDENCE_OPTIONS, EVIDENCE_STATUS, EXPERIMENTAL_NOTICE, EXTRA_DUNGEON_DESCRIPTION, GBA_GROUP_ORDER, NO_SUPPLEMENT, TRACKER_NOTE };
