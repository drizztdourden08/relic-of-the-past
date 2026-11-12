/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The analog stick of the touch controls: an outlined ring with a knob that follows the thumb.',
  useWhen: ['Inside the touch overlay and the touch layout editor, for the dynamic and fixed stick.'],
  avoidWhen: [{ case: 'A slider in a screen.', use: 'Slider' }],
  rules: ['Position the ring and the knob in px inside the overlay; it never takes touches itself.'],
  a11y: ['It is decoration over the game picture; the overlay owns the touches.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { TouchStick } from '@app/compounds/TouchStick';

const Mounted = (props: ComponentProps<typeof TouchStick>) => <TouchStick {...props} />;
`,
  propsHash: '',
} satisfies ComponentUsage;

export { usage };
