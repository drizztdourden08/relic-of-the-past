/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A line that shows how a controller connects, its rumble and gyro, and its id.',
  useWhen: ['Under the name of the selected controller.'],
  avoidWhen: [{ case: 'A row of labelled facts.', use: 'StatRow' }],
  rules: ['It renders nothing when the controller reports nothing.'],
  a11y: ['Each item has a title and a text label.'],
  buildingBlock: true,
  example: `import { ControllerStatusBar } from '@app/compounds/ControllerStatusBar';

const Mounted = () => <ControllerStatusBar hasRumble idLabel="045e:028e" />;
`,
  propsHash: '0c9b55d0573828f3',
} satisfies ComponentUsage;

export { usage };
