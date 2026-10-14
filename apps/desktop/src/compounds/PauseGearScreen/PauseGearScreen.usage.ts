/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The gear screen of the enhanced pause menu: a ladder of tiers for each kind of gear and the held items.',
  useWhen: ['Inside EnhancedPauseView, on the gear tab.'],
  avoidWhen: [{ case: 'The items screen.', use: 'Card' }],
  rules: ['Pass the ladders and the cursor; a click focuses a tier and confirms it.'],
  a11y: ['It is driven by the controller; cells also answer a click.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { PauseGearScreen } from '@app/compounds/PauseGearScreen';

const Mounted = (props: ComponentProps<typeof PauseGearScreen>) => <PauseGearScreen {...props} />;
`,
  propsHash: '1bf0f9cc2e1bd25d',
} satisfies ComponentUsage;

export { usage };
