/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The large progress ring, with a label above it, that fills while a thumb holds empty space to open the touch layout editor.',
  useWhen: ['Inside the touch overlay, centred on the touch point of a hold gesture.'],
  avoidWhen: [{ case: 'A progress bar in a screen.', use: 'ProgressBar' }],
  rules: ['Pass the touch point, the progress from 0 to 1 and the label naming what opens.', 'It is sized to stay visible around a thumb.'],
  a11y: ['It is decoration; the editor opens whether or not it is seen.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { HoldRing } from '@app/compounds/HoldRing';

const Mounted = (props: ComponentProps<typeof HoldRing>) => <HoldRing {...props} />;
`,
  propsHash: '',
} satisfies ComponentUsage;

export { usage };
