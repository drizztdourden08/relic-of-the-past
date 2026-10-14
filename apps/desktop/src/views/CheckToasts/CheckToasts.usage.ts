/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The toasts over the play area that announce a check the player found or a notice from the online room.',
  useWhen: ['Over the game picture, once, sized to the play area.'],
  avoidWhen: [{ case: 'A message in a window.', use: 'Toast' }],
  rules: ['Pass the size of the play area; the toasts stay inside it.', 'It shows nothing when the setting is off.'],
  a11y: ['Each toast has a label and can be dismissed.'],
  tree: { path: ['feedback', 'a short message that passes'], rule: 'A check found or an online notice.' },
  example: `import { CheckToasts } from '@app/views/CheckToasts';

const Mounted = () => <CheckToasts width={512} height={448} />;
`,
  propsHash: 'e80b86fff68dde3d',
} satisfies ComponentUsage;

export { usage };
