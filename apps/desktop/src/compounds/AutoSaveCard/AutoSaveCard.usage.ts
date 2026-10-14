/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'One automatic save in the list of saves, with its screenshot, the time and the Load and Delete buttons.',
  useWhen: ['Listing the saves the game made on its own, on a timer or at quit.'],
  avoidWhen: [{ case: 'An item of a catalogue shown as a card.', use: 'ItemCard' }],
  rules: ['Give each card its id; the callbacks return that id.', 'Pass busy while a save is loading so the buttons stop answering.'],
  a11y: ['Load and Delete are buttons with their own labels.'],
  tree: { path: ['data', 'a row in a list, with its actions'], rule: 'An automatic save in the list of saves.' },
  example: `import { AutoSaveCard } from '@app/compounds/AutoSaveCard';

const Mounted = () => <AutoSaveCard id="auto-1" timestamp={0} trigger="timer" screenshotUrl={null} busy={false} onLoad={() => undefined} onDelete={() => undefined} />;
`,
  propsHash: '69ca39c07212b253',
} satisfies ComponentUsage;

export { usage };
