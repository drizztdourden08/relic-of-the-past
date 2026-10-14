/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'One quick save slot with its screenshot, number, shortcut and the Load and Save buttons, armed by a second click.',
  useWhen: ['In the save state overlay and the save menu.'],
  avoidWhen: [{ case: 'An item of a catalogue shown as a card.', use: 'ItemCard' }],
  rules: ['Pass holdProgress to fill the card while a key is held.', 'A first click arms the action; the second one runs it.'],
  a11y: ['The buttons name the slot; an armed button says it waits for a second click.'],
  tree: { path: ['data', 'items of a catalogue, as cards'], rule: 'A quick save slot.' },
  example: `import type { ComponentProps } from 'react';
import { SaveSlot } from '@app/compounds/SaveSlot';

const Mounted = (props: ComponentProps<typeof SaveSlot>) => <SaveSlot {...props} />;
`,
  propsHash: '9e59d6a414e51305',
} satisfies ComponentUsage;

export { usage };
