/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A line that shows whether a controller is detected, how it connects, its rumble and gyro, and its id.',
  useWhen: ['Under the name of the selected controller.'],
  avoidWhen: [{ case: 'A row of labelled facts.', use: 'StatRow' }],
  rules: [
    'It renders nothing when the controller reports nothing.',
    'Set showAbsent to draw a missing rumble or gyro dimmed instead of leaving it out.',
  ],
  a11y: ['Each item has a title and a text label.'],
  buildingBlock: true,
  example: `import { ControllerStatusBar } from '@app/compounds/ControllerStatusBar';

const Mounted = () => <ControllerStatusBar hasRumble idLabel="045e:028e" />;
`,
  propsHash: '06b42af931aedb24',
} satisfies ComponentUsage;

export { usage };
