/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A list of SaveRows with the keys of a list: the arrows, Home and End move the selection, Delete deletes, F2 renames and Ctrl+Z undoes.',
  useWhen: ['Holding the rows of one kind of save, such as the manual saves or the quick slots.'],
  avoidWhen: [{ case: 'A list the user adds to and renames with nothing else on its rows.', use: 'ItemList' }],
  rules: [
    'Pass ids in the order the rows are drawn, without a row drawn as removed.',
    'Give each SaveRow the rowKey that is its id here.',
    'onDelete runs at once: the view keeps the row restorable with Undo and never asks first.',
  ],
  a11y: ['The list is one Tab stop on the selected row; focus follows the selection and returns to the row after a rename.'],
  tree: { path: ['data', 'a row in a list, with its actions'], rule: 'The list that holds save rows.' },
  example: `import { SaveList } from '@app/compounds/SaveList';
import { SaveRow } from '@app/compounds/SaveRow';

const Mounted = () => (
  <SaveList label="Saves" ids={['a']} onSelect={() => undefined}>
    <SaveRow rowKey="a" name="Before the palace" timestamp={0} screenshotUrl={null} />
  </SaveList>
);
`,
  propsHash: '4783485500cc77a7',
} satisfies ComponentUsage;

export { usage };
