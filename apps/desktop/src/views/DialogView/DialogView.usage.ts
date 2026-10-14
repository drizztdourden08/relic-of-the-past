/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The enhanced dialog box over the game: the text, the box, the prompts and the item picker.',
  useWhen: ['Inside GameOverlay, while the enhanced dialog box is on.'],
  avoidWhen: [{ case: 'A question the player answers in a window.', use: 'Dialog' }],
  rules: ['Mount it inside GameOverlay only; it reads the dialog frame from the store.'],
  a11y: ['It is decoration over the game picture and takes no focus.'],
  tree: { path: ['something over the page', 'a dialog with its own layout'], rule: 'The dialog box of the game.' },
  example: `import { DialogView } from '@app/views/DialogView';

const Mounted = () => <DialogView />;
`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
