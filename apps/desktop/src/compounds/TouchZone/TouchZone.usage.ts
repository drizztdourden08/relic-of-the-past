/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The dashed outline of the area where the dynamic stick appears, shown only while editing the layout.',
  useWhen: ['Inside the touch layout editor, around the dynamic stick zone.'],
  avoidWhen: [{ case: 'Any panel or card.', use: 'Card' }],
  rules: ['Position it in px inside the overlay; it never takes touches itself.'],
  a11y: ['It is decoration over the game picture; the editor owns the touches.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { TouchZone } from '@app/compounds/TouchZone';

const Mounted = (props: ComponentProps<typeof TouchZone>) => <TouchZone {...props} />;
`,
  propsHash: '',
} satisfies ComponentUsage;

export { usage };
