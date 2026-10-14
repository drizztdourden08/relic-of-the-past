/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'One row of the wishing pond section: the price curve, the throw count and the preview.',
  useWhen: ['In the wishing pond section of the randomizer settings.'],
  avoidWhen: [{ case: 'A plain label and control row.', use: 'FormRow' }],
  rules: ['Build the model with the pond row hook.', 'Pass readout for the read only form.'],
  a11y: ['Each control has a visible label.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { WishingPondRow } from '@app/compounds/WishingPondRow';

const Mounted = (props: ComponentProps<typeof WishingPondRow>) => <WishingPondRow {...props} />;
`,
  propsHash: 'ee0c12c77ce7342c',
} satisfies ComponentUsage;

export { usage };
