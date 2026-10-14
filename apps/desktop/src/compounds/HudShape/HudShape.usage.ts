/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A HUD shape such as a heart row, a bar or a block, drawn from its spec.',
  useWhen: ['Inside HudNodeRenderer, for a shape element.'],
  avoidWhen: [{ case: 'A drawing in a screen.', use: 'Canvas' }],
  rules: ['Pass the scope that resolves the values of the spec.'],
  a11y: ['It is decoration over the game picture.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { HudShape } from '@app/compounds/HudShape';

const Mounted = (props: ComponentProps<typeof HudShape>) => <HudShape {...props} />;
`,
  propsHash: 'b2a6c2b6c396e9ac',
} satisfies ComponentUsage;

export { usage };
