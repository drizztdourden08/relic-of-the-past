/* @layer renderer-components @kind data */
/** The fixed steps of the diagnostics wizard, in order. Byte capture only
 *  shows for a controller the raw HID enumeration can see (see
 *  chooser-devices.ts), so the visible order and labels are computed from
 *  that per run instead of being one static list. */

type WizardStep = 'intro' | 'choose-controller' | 'byte-capture' | 'positional-capture' | 'summary';

interface WizardStepInfo {
  step: WizardStep;
  label: string;
}

const ALL_STEPS: readonly WizardStepInfo[] = [
  { step: 'intro', label: 'Intro' },
  { step: 'choose-controller', label: 'Choose a controller' },
  { step: 'byte-capture', label: 'Byte capture' },
  { step: 'positional-capture', label: 'Positional capture' },
  { step: 'summary', label: 'Summary' },
];

/** `hasByteCapability` false drops the byte-capture step entirely, for a
 *  controller (XInput-style) the raw HID enumeration cannot see at all. */
const visibleSteps = (hasByteCapability: boolean): readonly WizardStepInfo[] =>
  hasByteCapability ? ALL_STEPS : ALL_STEPS.filter((s) => s.step !== 'byte-capture');

export { visibleSteps };
export type { WizardStep, WizardStepInfo };
