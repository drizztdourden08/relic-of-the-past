/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The countdown timer of the HUD, in the pixel or the smooth pie style.',
  useWhen: ['Inside the HUD, while a timed event runs.'],
  avoidWhen: [{ case: 'A progress bar in a screen.', use: 'ProgressBar' }],
  rules: ['Pass the total, the time left and the fraction left from the countdown store.'],
  a11y: ['It is decoration over the game picture.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { HudCountdown } from '@app/compounds/HudCountdown';

const Mounted = (props: ComponentProps<typeof HudCountdown>) => <HudCountdown {...props} />;
`,
  propsHash: '08f9f9cf3524ba22',
} satisfies ComponentUsage;

export { usage };
