/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The items screen of the enhanced pause menu: the item grid, the bottles, the name and the hint.',
  useWhen: ['Inside EnhancedPauseView, on the items tab.'],
  avoidWhen: [{ case: 'The gear screen.', use: 'Card' }],
  rules: ['Pass the item cells and the cursor; a click focuses a cell.'],
  a11y: ['It is driven by the controller; cells also answer a click.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { PauseItemsScreen } from '@app/compounds/PauseItemsScreen';

const Mounted = (props: ComponentProps<typeof PauseItemsScreen>) => <PauseItemsScreen {...props} />;
`,
  propsHash: '1beccad92cd2e6ca',
} satisfies ComponentUsage;

export { usage };
