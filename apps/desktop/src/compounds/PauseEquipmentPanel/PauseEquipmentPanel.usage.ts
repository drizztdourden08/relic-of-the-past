/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The equipment box of the original pause menu: sword, shield, armor and the dungeon items.',
  useWhen: ['Inside PauseMenuView.'],
  avoidWhen: [{ case: 'A panel of the enhanced pause menu.', use: 'Card' }],
  rules: ['Pass the equipment levels and the dungeon flags from the pause data.'],
  a11y: ['It draws game art over the game picture.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { PauseEquipmentPanel } from '@app/compounds/PauseEquipmentPanel';

const Mounted = (props: ComponentProps<typeof PauseEquipmentPanel>) => <PauseEquipmentPanel {...props} />;
`,
  propsHash: '41f09a9eed428cb0',
} satisfies ComponentUsage;

export { usage };
