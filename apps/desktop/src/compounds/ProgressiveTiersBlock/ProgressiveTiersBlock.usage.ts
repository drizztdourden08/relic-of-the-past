/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The randomizer block that sets which tiers of each progressive item are in the pool, and how each family is given out.',
  useWhen: ['In the randomizer settings, as the progressive items section.'],
  avoidWhen: [{ case: 'A list of plain toggles.', use: 'Toggle' }],
  rules: ['Pass the setting and the modes; the block holds no state.'],
  a11y: ['Each tier is a check box with its name.'],
  tree: { path: ['layout', 'a settings screen', 'one section of rows'], rule: 'The progressive items section of the randomizer settings.' },
  example: `import type { ComponentProps } from 'react';
import { ProgressiveTiersBlock } from '@app/compounds/ProgressiveTiersBlock';

const Mounted = (props: ComponentProps<typeof ProgressiveTiersBlock>) => <ProgressiveTiersBlock {...props} />;
`,
  propsHash: 'b0b735b992afcf4c',
} satisfies ComponentUsage;

export { usage };
