/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'One button of the HUD cluster, drawn with its glyph and its pressed and held looks.',
  useWhen: ['Inside HudNodeRenderer, for a button element.'],
  avoidWhen: [{ case: 'A button in a screen.', use: 'Button' }],
  rules: ['Pass unassigned for a slot with no item.', 'Pass pressed and held from the input state.'],
  a11y: ['It draws game art; the buttons of the screen stay the real controls.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { HudButton } from '@app/compounds/HudButton';

const Mounted = (props: ComponentProps<typeof HudButton>) => <HudButton {...props} />;
`,
  propsHash: 'a23d5bd04e6fc799',
} satisfies ComponentUsage;

export { usage };
