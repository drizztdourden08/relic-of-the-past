/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The small badges that say how a controller connects and whether it has rumble and gyro.',
  useWhen: ['Next to a controller name in the input settings.'],
  avoidWhen: [{ case: 'One state word such as connected.', use: 'Status' }],
  rules: ['Pass only what the device reports; missing flags show no badge.'],
  a11y: ['Each badge has a text label, never only an icon.'],
  buildingBlock: true,
  example: `import { ControllerCapabilityBadges } from '@app/compounds/ControllerCapabilityBadges';

const Mounted = () => <ControllerCapabilityBadges hasRumble hasGyro />;
`,
  propsHash: '3fb1df4b44611560',
} satisfies ComponentUsage;

export { usage };
