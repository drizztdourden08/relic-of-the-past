/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A small indicator over the game that shows how many items wait to be delivered.',
  useWhen: ['Inside GameOverlay.'],
  avoidWhen: [{ case: 'A count on a button.', use: 'Badge' }],
  rules: ['It shows nothing when the queue is empty.'],
  a11y: ['It is decoration over the game picture.'],
  tree: { path: ['feedback', 'a note that stays on the page'], rule: 'Items waiting to be delivered.' },
  example: `import { DeliveryQueueIndicator } from '@app/views/DeliveryQueueIndicator';

const Mounted = () => <DeliveryQueueIndicator />;
`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
