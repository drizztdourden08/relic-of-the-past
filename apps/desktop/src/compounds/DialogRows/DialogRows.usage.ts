/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The rows of dialog text, drawn from the glyph atlas or a modern font, with highlights and the item picture.',
  useWhen: ['Inside DialogBox, to draw the message.'],
  avoidWhen: [{ case: 'Ordinary text in a screen.', use: 'Text' }],
  rules: ['Pass the atlas, alphabet and highlight look from the dialog hooks.'],
  a11y: ['It draws the game text on a canvas; the screen reader gets no copy of it.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { DialogRows } from '@app/compounds/DialogRows';

const Mounted = (props: ComponentProps<typeof DialogRows>) => <DialogRows {...props} />;
`,
  propsHash: '8b1be8b2e24ee2ae',
} satisfies ComponentUsage;

export { usage };
