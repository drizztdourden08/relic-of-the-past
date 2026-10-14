/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The abilities box of the original pause menu: lift, read, talk, pull, run and swim, with the gear below.',
  useWhen: ['Inside PauseMenuView.'],
  avoidWhen: [{ case: 'A panel of the enhanced pause menu.', use: 'Card' }],
  rules: ['Pass the ability flags and the gear levels from the pause data.'],
  a11y: ['It draws game art over the game picture.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { PauseAbilitiesPanel } from '@app/compounds/PauseAbilitiesPanel';

const Mounted = (props: ComponentProps<typeof PauseAbilitiesPanel>) => <PauseAbilitiesPanel {...props} />;
`,
  propsHash: 'a6a98c786f85205a',
} satisfies ComponentUsage;

export { usage };
