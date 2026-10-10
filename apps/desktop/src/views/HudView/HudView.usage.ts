/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'Draws the classic HUD over the game: life, magic, the counters and the equipped item.',
  useWhen: ['Inside GameOverlay, while the classic HUD is on.'],
  avoidWhen: [{ case: 'A drawing that is not the HUD.', use: 'Canvas' }],
  rules: ['It reads the game state through useHud.'],
  a11y: ['It is decoration over the game picture and takes no focus.'],
  tree: { path: ['data', 'a drawing', 'in pixels'], rule: 'The classic HUD.' },
  example: `import { HudView } from '@app/views/HudView';\n\nconst Hud = () => <HudView />;\n`,
  propsHash: 'f48a80120ec498ef',
} satisfies ComponentUsage;

export { usage };
