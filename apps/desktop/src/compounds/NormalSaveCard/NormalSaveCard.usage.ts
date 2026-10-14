/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'One manual save in the list of saves, with its screenshot, name and the Load, Overwrite, Rename and Delete actions.',
  useWhen: ['Listing the saves the player made by hand.'],
  avoidWhen: [{ case: 'An item of a catalogue shown as a card.', use: 'ItemCard' }],
  rules: ['Give each card its id; the callbacks return that id.', 'Pass isGameRunning so Overwrite is offered only while a game runs.'],
  a11y: ['Every action is a labelled button and the name edit is a text field.'],
  tree: { path: ['data', 'a row in a list, with its actions'], rule: 'A manual save in the list of saves.' },
  example: `import type { ComponentProps } from 'react';
import { NormalSaveCard } from '@app/compounds/NormalSaveCard';

const Mounted = (props: ComponentProps<typeof NormalSaveCard>) => <NormalSaveCard {...props} />;
`,
  propsHash: 'dee1c97b252d7896',
} satisfies ComponentUsage;

export { usage };
