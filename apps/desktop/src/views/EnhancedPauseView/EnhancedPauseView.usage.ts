/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The redrawn pause menu: the items, gear and status screens over the game, driven by the controller.',
  useWhen: ['While the game is paused and the enhanced HUD is on.'],
  avoidWhen: [{ case: 'A question the user must answer.', use: 'Dialog' }],
  rules: ['Mount it inside GameOverlay only; it reads the pause state from the game UI store.'],
  a11y: ['Every screen moves with the d-pad and names its selected item.'],
  tree: { path: ['something over the page', 'a dialog with its own layout'], rule: 'The pause menu when the enhanced HUD is on.' },
  example: `import { EnhancedPauseView } from '@app/views/EnhancedPauseView';\n\nconst Pause = () => <EnhancedPauseView />;\n`,
  propsHash: 'f48a80120ec498ef',
} satisfies ComponentUsage;

export { usage };
