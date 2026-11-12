/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The circular progress ring that fills while a thumb holds empty space to open the menu.',
  useWhen: ['Inside the touch overlay, at the touch point of a hold-for-menu gesture.'],
  avoidWhen: [{ case: 'A progress bar in a screen.', use: 'ProgressBar' }],
  rules: ['Pass the touch point and the progress from 0 to 1.'],
  a11y: ['It is decoration; the menu opens whether or not it is seen.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { HoldRing } from '@app/compounds/HoldRing';

const Mounted = (props: ComponentProps<typeof HoldRing>) => <HoldRing {...props} />;
`,
  propsHash: '',
} satisfies ComponentUsage;

export { usage };
