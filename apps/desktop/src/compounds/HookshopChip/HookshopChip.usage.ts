/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A small chip that marks a pack as coming from the Hookshop.',
  useWhen: ['Next to the name of an installed pack.'],
  avoidWhen: [{ case: 'A chip with a count.', use: 'Badge' }],
  rules: ['Leave the label out for the default text.'],
  a11y: ['The chip text names its source.'],
  buildingBlock: true,
  example: `import { HookshopChip } from '@app/compounds/HookshopChip';

const Mounted = () => <HookshopChip />;
`,
  propsHash: '4f2c48727929cfed',
} satisfies ComponentUsage;

export { usage };
