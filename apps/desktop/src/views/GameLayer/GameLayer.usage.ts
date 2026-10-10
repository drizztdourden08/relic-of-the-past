/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The game canvas, its renderer, and the navigation and shadow editor overlays drawn over it.',
  useWhen: ['Once, inside GameView, where the game picture belongs.'],
  avoidWhen: [{ case: 'A drawing that is not the game.', use: 'Canvas' }],
  rules: ['Give it the asset blob; it starts the core and owns the canvas.'],
  a11y: ['The canvas takes the keyboard while no screen is open.'],
  tree: { path: ['data', 'a drawing', 'in pixels'], rule: 'The game picture.' },
  example: `import { GameLayer } from '@app/views/GameLayer';\n\nconst Game = ({ assets }: { assets: Uint8Array | null }) => <GameLayer assetData={assets} />;\n`,
  propsHash: '2888b1d6af29db35',
} satisfies ComponentUsage;

export { usage };
