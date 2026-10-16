/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'One manual save in the list of saves, with its screenshot, name, date and the Load, Overwrite and Delete buttons.',
  useWhen: ['Listing the saves the player made by hand.'],
  avoidWhen: [{ case: 'An item of a catalogue shown as a card.', use: 'ItemCard' }],
  rules: [
    'Give each row its id; the callbacks return that id.',
    'The callbacks only ask. The view confirms with a dialog before it acts.',
    'Pass isGameRunning so Overwrite is offered only while a game runs.',
  ],
  a11y: ['Every action is a labelled button, the full name is in a tooltip and the name edit is a text field.'],
  tree: { path: ['data', 'a row in a list, with its actions'], rule: 'A manual save in the list of saves.' },
  example: `import type { ComponentProps } from 'react';
import { SaveListRow } from '@app/compounds/SaveListRow';

const Mounted = (props: ComponentProps<typeof SaveListRow>) => <SaveListRow {...props} />;
`,
  propsHash: 'dee1c97b252d7896',
} satisfies ComponentUsage;

export { usage };
