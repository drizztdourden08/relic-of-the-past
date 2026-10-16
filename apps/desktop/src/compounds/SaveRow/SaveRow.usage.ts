/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'One save in a list of saves: its screenshot, its name and how long ago it was made, with small actions that show on hover, focus or selection.',
  useWhen: ['Listing manual saves, quick save slots or auto-saves.'],
  avoidWhen: [{ case: 'An item of a catalogue shown as a card.', use: 'ItemCard' }],
  rules: [
    'Put the rows in a SaveList, which moves the selection with the arrow keys.',
    'onActivate is the load: a click, Enter or Space on the row runs it. Leave it out for an empty slot.',
    'Pass notice after an action so the row offers Undo in place. A deleted notice draws the row as removed.',
    'Give an action a disabledReason when it cannot run, such as no game running.',
  ],
  a11y: ['The row is one button, each action is a labelled icon button with a tooltip, and Undo is announced as a status.'],
  tree: { path: ['data', 'a row in a list, with its actions'], rule: 'A save in a list of saves.' },
  example: `import { SaveRow } from '@app/compounds/SaveRow';

const Mounted = () => <SaveRow rowKey="a" name="Before the palace" timestamp={0} screenshotUrl={null} onActivate={() => undefined} />;
`,
  propsHash: '6d99125c06d13413',
} satisfies ComponentUsage;

export { usage };
