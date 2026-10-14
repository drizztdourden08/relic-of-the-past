/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The randomizer block that sets how bombs, arrows, wallets and the other capacity upgrades are given out.',
  useWhen: ['In the randomizer settings, as the capacity upgrades section.'],
  avoidWhen: [{ case: 'A section of plain label and control rows.', use: 'FormRow' }],
  rules: ['Pass the rows the capacity hook built; the block holds no state.', 'Pass readOnly to freeze the controls while a room is locked.'],
  a11y: ['The group has a visible title and every row names its family.'],
  tree: { path: ['layout', 'a settings screen', 'one section of rows'], rule: 'The capacity upgrades section of the randomizer settings.' },
  example: `import type { ComponentProps } from 'react';
import { CapacityUpgradesBlock } from '@app/compounds/CapacityUpgradesBlock';

const Mounted = (props: ComponentProps<typeof CapacityUpgradesBlock>) => <CapacityUpgradesBlock {...props} />;
`,
  propsHash: '54b8e46f4126a4bf',
} satisfies ComponentUsage;

export { usage };
