/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The ground, texture and border of an in-game dialog box, drawn at the game scale.',
  useWhen: ['Inside DialogView, around the rows of text.'],
  avoidWhen: [{ case: 'A box with a header and actions.', use: 'Card' }],
  rules: ['Pass the look models the dialog settings built; never raw colours.', 'Children are drawn above the ground and below the border.'],
  a11y: ['It is decoration; the text it holds is read from the rows.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { DialogBox } from '@app/compounds/DialogBox';

const Mounted = (props: ComponentProps<typeof DialogBox>) => <DialogBox {...props} />;
`,
  propsHash: '01a61c177076aef9',
} satisfies ComponentUsage;

export { usage };
