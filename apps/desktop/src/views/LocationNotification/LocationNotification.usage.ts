/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A banner over the game that names the place the hero entered.',
  useWhen: ['Inside GameOverlay, when a new area or room starts.'],
  avoidWhen: [{ case: 'A message in a window.', use: 'Toast' }],
  rules: ['It reads the notification store and fades by itself.'],
  a11y: ['It is decoration over the game picture.'],
  tree: { path: ['feedback', 'a short message that passes'], rule: 'The name of a new area.' },
  example: `import { LocationNotification } from '@app/views/LocationNotification';

const Mounted = () => <LocationNotification />;
`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
