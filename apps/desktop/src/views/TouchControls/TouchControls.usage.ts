/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The on-screen touch controls: buttons, stick or D-pad over the game, a hold on empty space that opens the layout editor, and the editor itself.',
  useWhen: ['Once on Android, over the running game.'],
  avoidWhen: [{ case: 'The title bar of a desktop window.', use: 'WindowTitleBar' }],
  rules: ['Render it only when isMobileHost() is true; it hides itself while a screen is open or input is paused.'],
  a11y: ['It is a touch surface over the game picture; the layout editor opens by a hold on empty space or from the side menu.'],
  tree: { path: ['navigation', 'between a few modes, from a floating switch'], rule: 'The game input on hosts with no keyboard.' },
  example: `import { TouchControls } from '@app/views/TouchControls';\n\nconst Mobile = () => <TouchControls />;\n`,
  propsHash: '',
} satisfies ComponentUsage;

export { usage };
