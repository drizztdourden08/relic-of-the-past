/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The magic meter of the HUD as a bar.',
  useWhen: ['Inside the pause status screen and the HUD layouts that show a bar.'],
  avoidWhen: [{ case: 'A gauge in a screen.', use: 'Gauge' }],
  rules: ['Pass the magic value and whether the cost is halved.'],
  a11y: ['It is decoration over the game picture.'],
  buildingBlock: true,
  example: `import { HudMagicBar } from '@app/compounds/HudMagicBar';

const Mounted = () => <HudMagicBar value={64} halfMagic={false} scale={2} />;
`,
  propsHash: 'cf45b98062608442',
} satisfies ComponentUsage;

export { usage };
