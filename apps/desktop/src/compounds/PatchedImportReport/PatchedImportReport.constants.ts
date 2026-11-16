/* @layer renderer-components @kind constants */
import { defineStatuses } from '@drizztdourden08/tessera/primitives';
import type { PatchedPartId } from '@rotp/asset-extraction';

const PART_STATUSES = defineStatuses({
  ok: { label: 'Ok', tone: 'success' },
  recovered: { label: 'Recovered', tone: 'warning' },
  failed: { label: 'Failed', tone: 'danger' },
});

const PART_LABELS: Readonly<Record<PatchedPartId, string>> = {
  dialogue: 'Dialogue',
  'font-tiles': 'Font pictures',
  letters: 'New letters',
  dictionary: 'Dictionary',
  'menu-text': 'Menu and caption text',
  credits: 'Credits',
};

export { PART_LABELS, PART_STATUSES };
