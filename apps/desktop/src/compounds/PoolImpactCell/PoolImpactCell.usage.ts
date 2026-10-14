/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A cell that shows how much an option adds to or takes from the item pool.',
  useWhen: ['At the end of an option row.'],
  avoidWhen: [{ case: 'A count badge.', use: 'Badge' }],
  rules: ['Pass the impact the pool hook computed.'],
  a11y: ['The impact is written as text with a sign.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { PoolImpactCell } from '@app/compounds/PoolImpactCell';

const Mounted = (props: ComponentProps<typeof PoolImpactCell>) => <PoolImpactCell {...props} />;
`,
  propsHash: '6c10f8d40f8e76e4',
} satisfies ComponentUsage;

export { usage };
