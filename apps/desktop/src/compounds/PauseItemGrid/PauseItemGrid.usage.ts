/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The item grid of the original pause menu, with the cursor on the selected item.',
  useWhen: ['Inside PauseMenuView.'],
  avoidWhen: [{ case: 'The items screen of the enhanced menu.', use: 'Card' }],
  rules: ['Pass the item values in save order.', 'Pass staticSelection to stop the cursor from flashing.'],
  a11y: ['It draws game art over the game picture.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { PauseItemGrid } from '@app/compounds/PauseItemGrid';

const Mounted = (props: ComponentProps<typeof PauseItemGrid>) => <PauseItemGrid {...props} />;
`,
  propsHash: '0c519814447fb276',
} satisfies ComponentUsage;

export { usage };
