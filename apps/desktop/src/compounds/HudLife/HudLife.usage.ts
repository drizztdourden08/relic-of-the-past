/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The hearts of the HUD, drawn from sprites or shapes, with the Life caption.',
  useWhen: ['Inside the HUD and the pause menu.'],
  avoidWhen: [{ case: 'A health bar in a screen.', use: 'ProgressBar' }],
  rules: ['Pass the health in game units and the heart mode.'],
  a11y: ['It is decoration over the game picture.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { HudLife } from '@app/compounds/HudLife';

const Mounted = (props: ComponentProps<typeof HudLife>) => <HudLife {...props} />;
`,
  propsHash: 'd06dcc0640cba9a1',
} satisfies ComponentUsage;

export { usage };
