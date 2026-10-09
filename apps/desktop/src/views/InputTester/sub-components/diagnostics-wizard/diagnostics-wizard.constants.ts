/* @layer renderer-components @kind constants */
import type { WizardStepInfo } from './diagnostics-wizard.type';

const ALL_STEPS: readonly WizardStepInfo[] = [
  { step: 'intro', label: 'Intro' },
  { step: 'choose-controller', label: 'Choose a controller' },
  { step: 'byte-capture', label: 'Byte capture' },
  { step: 'positional-capture', label: 'Positional capture' },
  { step: 'summary', label: 'Summary' },
];

const LAYOUT_POLL_MS = 120;
const CLAIM_TIMEOUT_MS = 4000;
const SHUTDOWN_POLL_MS = 150;
const SETTLE_MS = 1500;

export { ALL_STEPS, CLAIM_TIMEOUT_MS, LAYOUT_POLL_MS, SETTLE_MS, SHUTDOWN_POLL_MS };
