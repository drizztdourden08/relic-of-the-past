/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The layer over the game picture that holds the HUD, the pause menu, the title screen, the dialog box and the notices.',
  useWhen: ['Over the game canvas, sized to it.'],
  avoidWhen: [{ case: 'A layer of ordinary screen parts.', use: 'Box' }],
  rules: ['Pass the size of the canvas and the active profile id.', 'It never takes the pointer from the game, only its own buttons.'],
  a11y: ['The layer is decoration; focus stays with the game.'],
  tree: { path: ['layout', 'a plain block'], rule: 'The stack of in game surfaces over the game picture.' },
  example: `import { GameOverlay } from '@app/views/GameOverlay';

const Mounted = () => <GameOverlay width={512} height={448} profileId="p1" />;
`,
  propsHash: '83ec802ef44744cb',
} satisfies ComponentUsage;

export { usage };
