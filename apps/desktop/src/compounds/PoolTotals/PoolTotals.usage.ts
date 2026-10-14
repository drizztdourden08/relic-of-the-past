/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The totals line of the item pool: how many items, how many slots and how many are left over.',
  useWhen: ['Above the pool listing and the fill bar.'],
  avoidWhen: [{ case: 'A headline number.', use: 'StatTile' }],
  rules: ['Pass null totals and an error text when the pool cannot be counted.'],
  a11y: ['The numbers are text.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { PoolTotals } from '@app/compounds/PoolTotals';

const Mounted = (props: ComponentProps<typeof PoolTotals>) => <PoolTotals {...props} />;
`,
  propsHash: '4cf74cdd6d070ec2',
} satisfies ComponentUsage;

export { usage };
