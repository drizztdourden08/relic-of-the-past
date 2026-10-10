/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'Draws the HUD from the active layout over the game.',
  useWhen: ['Inside GameOverlay, while a layout based HUD is on.'],
  avoidWhen: [{ case: 'A drawing that is not the HUD.', use: 'Canvas' }],
  rules: ['It reads the layout and the game state from the stores; it takes no data props.'],
  a11y: ['It is decoration over the game picture and takes no focus.'],
  tree: { path: ['data', 'a drawing', 'in pixels'], rule: 'The layout based HUD.' },
  example: `import { HudLayoutView } from '@app/views/HudLayoutView';\n\nconst Hud = () => <HudLayoutView />;\n`,
  propsHash: '7df429e49c70bb51',
} satisfies ComponentUsage;

export { usage };
