/* @layer renderer-components @kind constants */
import type { SelectOption } from '@ds/primitives';

const MODE_OPTIONS: readonly SelectOption[] = [
  { value: 'vanilla', label: 'Vanilla' },
  { value: 'vanilla-in-pool', label: 'Vanilla in pool' },
  { value: 'custom', label: 'Custom' },
];

const WALLET_MODE_OPTIONS: readonly SelectOption[] = MODE_OPTIONS.filter((option) => option.value !== 'vanilla-in-pool');

const STEP_BASE_LABEL = 'of the gain';

export { MODE_OPTIONS, STEP_BASE_LABEL, WALLET_MODE_OPTIONS };
