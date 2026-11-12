/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'One on-screen button of the touch controls: a faint outlined circle or pill with a label.',
  useWhen: ['Inside the touch overlay and the touch layout editor.'],
  avoidWhen: [{ case: 'A button in a screen.', use: 'Button' }],
  rules: ['Position it by its centre in px inside the overlay; it never takes touches itself.'],
  a11y: ['It is decoration over the game picture; the overlay owns the touches.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { TouchButton } from '@app/compounds/TouchButton';

const Mounted = (props: ComponentProps<typeof TouchButton>) => <TouchButton {...props} />;
`,
  propsHash: '',
} satisfies ComponentUsage;

export { usage };
