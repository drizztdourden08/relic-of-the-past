/* @layer renderer-components @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The side panel that lists the randomizer pool by group with its fill totals.',
  useWhen: ['Beside the randomizer options, as the pool aside.'],
  avoidWhen: [{ case: 'A few labelled values with no group listing.', use: 'FactsPanel' }],
  rules: ['Pass the groups, the totals or null, and an error text when the pool could not be read.'],
  a11y: ['The panel title and the listing headings name what is shown.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';\nimport { PoolSidePanel } from '@app/compounds/PoolSidePanel';\n\nconst Mounted = (props: ComponentProps<typeof PoolSidePanel>) => <PoolSidePanel {...props} />;\n`,
  propsHash: '412dd4d824a40f0e',
} satisfies ComponentUsage;

export { usage };
