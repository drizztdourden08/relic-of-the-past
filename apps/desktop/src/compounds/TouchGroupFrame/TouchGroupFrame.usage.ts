/* @layer renderer-components @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The outline drawn around a group of touch controls in the layout editor, with a badge when it is locked.',
  useWhen: ['Inside the touch layout editor, around a group of buttons.'],
  avoidWhen: [{ case: 'Any panel or card.', use: 'Card' }],
  rules: ['Position it by a rect in px inside the overlay; it never takes touches itself.'],
  a11y: ['It is decoration over the game picture; the editor owns the touches.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';\nimport { TouchGroupFrame } from '@app/compounds/TouchGroupFrame';\n\nconst Mounted = (props: ComponentProps<typeof TouchGroupFrame>) => <TouchGroupFrame {...props} />;\n`,
  propsHash: 'f12d34cc7ea7ce62',
} satisfies ComponentUsage;

export { usage };
