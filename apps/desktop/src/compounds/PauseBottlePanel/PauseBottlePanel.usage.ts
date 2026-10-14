/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The bottle list of the original pause menu, with the cursor on the selected bottle.',
  useWhen: ['Inside PauseMenuView, while a bottle is selected.'],
  avoidWhen: [{ case: 'A list in a screen.', use: 'ItemList' }],
  rules: ['Pass the four bottle contents and the selected index.'],
  a11y: ['It draws game art over the game picture.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { PauseBottlePanel } from '@app/compounds/PauseBottlePanel';

const Mounted = (props: ComponentProps<typeof PauseBottlePanel>) => <PauseBottlePanel {...props} />;
`,
  propsHash: '968df7107d397b7f',
} satisfies ComponentUsage;

export { usage };
