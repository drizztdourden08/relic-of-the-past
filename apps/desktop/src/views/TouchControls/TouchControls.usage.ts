/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The on-screen touch controls: buttons, stick or D-pad over the game, a hold-for-menu gesture and the layout editor.',
  useWhen: ['Once on Android, over the running game, when touch controls are enabled.'],
  avoidWhen: [{ case: 'The title bar of a desktop window.', use: 'WindowTitleBar' }],
  rules: ['Render it only when isMobileHost() is true; it hides itself when disabled, when a pad is connected or when a screen is open.'],
  a11y: ['It is a touch surface over the game picture; the menu drawer opens by a hold on empty space or the back gesture.'],
  tree: { path: ['navigation', 'between a few modes, from a floating switch'], rule: 'The game input on hosts with no keyboard.' },
  example: `import { TouchControls } from '@app/views/TouchControls';\n\nconst Mobile = () => <TouchControls />;\n`,
  propsHash: '',
} satisfies ComponentUsage;

export { usage };
