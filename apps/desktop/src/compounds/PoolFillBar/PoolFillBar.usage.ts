/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A bar that shows how full the item pool is, with the totals or the error.',
  useWhen: ['In the randomizer, next to the pool listing.'],
  avoidWhen: [{ case: 'Any other progress.', use: 'ProgressBar' }],
  rules: ['Pass null totals and an error text when the pool cannot be counted.'],
  a11y: ['The numbers are text beside the bar.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { PoolFillBar } from '@app/compounds/PoolFillBar';

const Mounted = (props: ComponentProps<typeof PoolFillBar>) => <PoolFillBar {...props} />;
`,
  propsHash: 'cdf67affca60ecdf',
} satisfies ComponentUsage;

export { usage };
