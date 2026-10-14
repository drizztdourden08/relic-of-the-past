/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The portrait of the hero on the enhanced pause menu, drawn from a player sheet.',
  useWhen: ['Inside EnhancedPauseView, beside the screen being browsed.'],
  avoidWhen: [{ case: 'A picture of any other thing.', use: 'Image' }],
  rules: ['Pass the sheet, the resolved row and the pose state.'],
  a11y: ['It is decoration over the game picture.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { PauseHeroPortrait } from '@app/compounds/PauseHeroPortrait';

const Mounted = (props: ComponentProps<typeof PauseHeroPortrait>) => <PauseHeroPortrait {...props} />;
`,
  propsHash: '8ccbe051d331ed1e',
} satisfies ComponentUsage;

export { usage };
