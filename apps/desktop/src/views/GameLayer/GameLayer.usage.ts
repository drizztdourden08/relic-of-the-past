/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The game canvas, its renderer, and the navigation overlay drawn over it.',
  useWhen: ['Once, inside GameView, where the game picture belongs.'],
  avoidWhen: [{ case: 'A drawing that is not the game.', use: 'Canvas' }],
  rules: ['Give it the asset blob; it starts the core and owns the canvas.'],
  a11y: ['The canvas takes the keyboard while no screen is open.'],
  tree: { path: ['data', 'a drawing', 'in pixels'], rule: 'The game picture.' },
  example: `import { GameLayer } from '@app/views/GameLayer';\n\nconst Game = ({ assets }: { assets: Uint8Array | null }) => <GameLayer assetData={assets} />;\n`,
  propsHash: '033ba6e4d1c82999',
} satisfies ComponentUsage;

export { usage };
