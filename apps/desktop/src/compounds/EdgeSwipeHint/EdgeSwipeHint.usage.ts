/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A quiet animated cue on both screen edges that shows which edge swipe does what on a touch host.',
  useWhen: ['On Android while no game is playing, so a new player finds the edge swipes.'],
  avoidWhen: [{ case: 'A desktop window, where the title bar menu is always visible.', use: 'WindowTitleBar' }],
  rules: [
    'Show it only while no game runs and no screen or drawer is open.',
    'It takes no touches: the edge swipes pass through it.',
  ],
  a11y: ['Hidden from assistive technology; the drawer and back gesture carry their own labels.'],
  tree: { path: ['feedback', 'a note that stays on the page'], rule: 'A gesture cue over the screen on touch hosts.' },
  example: `import { EdgeSwipeHint } from '@app/compounds/EdgeSwipeHint';

const Hint = () => <EdgeSwipeHint startLabel="Home" endLabel="Menu" />;
`,
  propsHash: '9d72fd8b4bccfc06',
} satisfies ComponentUsage;

export { usage };
