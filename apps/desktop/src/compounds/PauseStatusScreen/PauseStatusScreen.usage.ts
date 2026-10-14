/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The status screen of the enhanced pause menu: hearts, magic, pendants, crystals, dungeon items and the Continue and Save and quit actions.',
  useWhen: ['Inside EnhancedPauseView, on the status tab.'],
  avoidWhen: [{ case: 'The items screen.', use: 'Card' }],
  rules: ['Pass the vitals and the cursor; a click on an action focuses and confirms it.'],
  a11y: ['It is driven by the controller; the actions also answer a click.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { PauseStatusScreen } from '@app/compounds/PauseStatusScreen';

const Mounted = (props: ComponentProps<typeof PauseStatusScreen>) => <PauseStatusScreen {...props} />;
`,
  propsHash: '48ca31e5cda8c32a',
} satisfies ComponentUsage;

export { usage };
