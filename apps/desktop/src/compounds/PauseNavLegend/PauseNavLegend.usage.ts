/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The legend at the foot of the enhanced pause menu that lists the buttons and what they do.',
  useWhen: ['Inside EnhancedPauseView, at the bottom edge.'],
  avoidWhen: [{ case: 'A hint line in a window.', use: 'Shortcut' }],
  rules: ['Pass the entries the legend hook built from the bindings.'],
  a11y: ['It is decoration; the verbs are also in the screen.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { PauseNavLegend } from '@app/compounds/PauseNavLegend';

const Mounted = (props: ComponentProps<typeof PauseNavLegend>) => <PauseNavLegend {...props} />;
`,
  propsHash: '53bc1b8525c198e8',
} satisfies ComponentUsage;

export { usage };
