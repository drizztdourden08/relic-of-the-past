/* @layer renderer-components @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'Reviews the extracted sprite images and the item to sprite mapping of one ROM, marking each as good, bad or to look at again.',
  useWhen: ['As the body of the sprite debug layer.'],
  avoidWhen: [{ case: 'A screen with a header over one block.', use: 'ScreenPage' }],
  rules: ['Pass the ROM file; the marks save themselves a moment after each change.'],
  a11y: ['Every status button is a labelled control and the grid follows the reading order.'],
  tree: { path: ['a full screen view', 'one big custom surface, such as calibration'], rule: 'The sprite debug review.' },
  example: `import { SpriteDebug } from '@app/views/SpriteDebug';\n\nconst Layer = () => <SpriteDebug romFile="alttp.sfc" />;\n`,
  propsHash: '521add397fda3e1a',
} satisfies ComponentUsage;

export { usage };
