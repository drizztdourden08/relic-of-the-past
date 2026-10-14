/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The pendants or crystals box of the original pause menu.',
  useWhen: ['Inside PauseMenuView.'],
  avoidWhen: [{ case: 'A progress bar.', use: 'ProgressBar' }],
  rules: ['Pass showCrystals to switch from pendants to crystals.'],
  a11y: ['It draws game art over the game picture.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { PauseProgressPanel } from '@app/compounds/PauseProgressPanel';

const Mounted = (props: ComponentProps<typeof PauseProgressPanel>) => <PauseProgressPanel {...props} />;
`,
  propsHash: '7c9c0be4817919df',
} satisfies ComponentUsage;

export { usage };
