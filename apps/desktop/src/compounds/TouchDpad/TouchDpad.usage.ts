/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The D-pad of the touch controls: a cross with a centre hub and an arrow on each arm, lighting the pressed arms.',
  useWhen: ['Inside the touch overlay and the touch layout editor, when movement is a D-pad.'],
  avoidWhen: [{ case: 'A slider in a screen.', use: 'Slider' }],
  rules: ['Position it by its centre in px inside the overlay; it never takes touches itself.'],
  a11y: ['It is decoration over the game picture; the overlay owns the touches.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { TouchDpad } from '@app/compounds/TouchDpad';

const Mounted = (props: ComponentProps<typeof TouchDpad>) => <TouchDpad {...props} />;
`,
  propsHash: '',
} satisfies ComponentUsage;

export { usage };
