/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The original pause menu of the game, redrawn at the HUD scale.',
  useWhen: ['While the game is paused and the enhanced HUD is off.'],
  avoidWhen: [{ case: 'A question the user must answer.', use: 'Dialog' }],
  rules: ['Mount it inside GameOverlay only.'],
  a11y: ['The game moves the cursor; the menu shows the selected item by name.'],
  tree: { path: ['something over the page', 'a dialog with its own layout'], rule: 'The classic pause menu.' },
  example: `import { PauseMenuView } from '@app/views/PauseMenuView';\n\nconst Pause = () => <PauseMenuView />;\n`,
  propsHash: 'f48a80120ec498ef',
} satisfies ComponentUsage;

export { usage };
