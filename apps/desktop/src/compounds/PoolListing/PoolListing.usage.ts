/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The list of the item pool in groups, with the totals above it.',
  useWhen: ['In the randomizer pool view.'],
  avoidWhen: [{ case: 'A table to sort.', use: 'Card' }],
  rules: ['Pass the groups in the order to show.'],
  a11y: ['Each group has a heading.'],
  tree: { path: ['data', 'one record, compact and read only'], rule: 'The item pool of a randomizer run.' },
  example: `import type { ComponentProps } from 'react';
import { PoolListing } from '@app/compounds/PoolListing';

const Mounted = (props: ComponentProps<typeof PoolListing>) => <PoolListing {...props} />;
`,
  propsHash: '0bdbe238621a746b',
} satisfies ComponentUsage;

export { usage };
