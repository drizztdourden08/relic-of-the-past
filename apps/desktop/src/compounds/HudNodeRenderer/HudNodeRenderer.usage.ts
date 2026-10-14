/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'Draws a placed HUD layout: each node at its place, with its motion, enter and exit.',
  useWhen: ['In the HUD layout view and the pause menu button cluster.'],
  avoidWhen: [{ case: 'A layout of ordinary screen parts.', use: 'Box' }],
  rules: ['Pass nodes already placed by the layout engine.', 'Pass the data scope so values and animations resolve.'],
  a11y: ['It draws game art; slot nodes accept a press when onSlotPress is given.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { HudNodeRenderer } from '@app/compounds/HudNodeRenderer';

const Mounted = (props: ComponentProps<typeof HudNodeRenderer>) => <HudNodeRenderer {...props} />;
`,
  propsHash: '37256ddc9134961f',
} satisfies ComponentUsage;

export { usage };
