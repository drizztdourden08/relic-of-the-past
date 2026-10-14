/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'One row of the capacity upgrades block: the mode choice, the custom ladder controls, the bonus and a preview of the ladder.',
  useWhen: ['Inside CapacityUpgradesBlock, once for each upgrade family.'],
  avoidWhen: [{ case: 'A single on or off setting.', use: 'Toggle' }],
  rules: ['Build the model with the capacity row model hook; do not assemble it by hand.', 'Pass readout to show the values as tags instead of controls.'],
  a11y: ['The mode select and the sliders carry the family name as their label.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { CapacityFamilyRow } from '@app/compounds/CapacityFamilyRow';

const Mounted = (props: ComponentProps<typeof CapacityFamilyRow>) => <CapacityFamilyRow {...props} />;
`,
  propsHash: '8a785c23b5e5bd92',
} satisfies ComponentUsage;

export { usage };
