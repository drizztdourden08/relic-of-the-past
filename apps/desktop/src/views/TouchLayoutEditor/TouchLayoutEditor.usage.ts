/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The editor that moves and resizes the touch buttons, the stick or D-pad and their groups, with cards for the shared touch settings.',
  useWhen: ['Over the game when a hold on empty space or the side menu opens the touch layout editing.'],
  avoidWhen: [{ case: 'A panel or card that only shows information.', use: 'Card' }],
  rules: ['Pass the layout of the orientation, the screen box and the touch settings; it saves and closes by its callbacks.'],
  a11y: ['Every card control is labelled; dragging has the card fields as its keyboard path.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';\nimport { TouchLayoutEditor } from '@app/views/TouchLayoutEditor';\n\nconst Edit = (props: ComponentProps<typeof TouchLayoutEditor>) => <TouchLayoutEditor {...props} />;\n`,
  propsHash: '1b99657d46e7cbc3',
} satisfies ComponentUsage;

export { usage };
