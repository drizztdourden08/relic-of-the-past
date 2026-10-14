/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The randomizer block that sets which shop slots hold random items.',
  useWhen: ['In the randomizer settings, as the shop slots section.'],
  avoidWhen: [{ case: 'A list of plain toggles.', use: 'Toggle' }],
  rules: ['Pass the scope; changes return the whole next scope.'],
  a11y: ['Each slot has a check box with its name.'],
  tree: { path: ['layout', 'a settings screen', 'one section of rows'], rule: 'The shop slots section of the randomizer settings.' },
  example: `import type { ComponentProps } from 'react';
import { ShopSlotsBlock } from '@app/compounds/ShopSlotsBlock';

const Mounted = (props: ComponentProps<typeof ShopSlotsBlock>) => <ShopSlotsBlock {...props} />;
`,
  propsHash: 'b4885c930d6ada09',
} satisfies ComponentUsage;

export { usage };
