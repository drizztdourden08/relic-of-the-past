/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The page of one connected controller: its live picture, sticks and triggers, buttons, and facts in four boxes.',
  useWhen: ['As the page of one pad in the controllers area, with the device key of that pad.'],
  avoidWhen: [{ case: 'A short list of facts about one controller.', use: 'FactsPanel' }],
  rules: ['Pass the device key of a pad; the page reads its own state and shows a notice when the pad is gone.'],
  a11y: ['The pad picture is a labelled figure that lists the inputs held down as text.'],
  buildingBlock: true,
  example: `import { ControllerPage } from '@app/views/ControllerPage';

const Mounted = () => <ControllerPage deviceKey="045e:0b12" />;
`,
  propsHash: '53fff517beda72ba',
} satisfies ComponentUsage;

export { usage };
