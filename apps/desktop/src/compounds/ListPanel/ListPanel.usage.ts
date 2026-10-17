/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A compact list beside a work area, with one button at its top, that folds to an icon rail.',
  useWhen: ['The Controls page lists input profiles on its left and detected devices on its right.'],
  avoidWhen: [
    { case: 'A list sits beside the detail of the picked item.', use: 'ListDetailLayout' },
    { case: 'A raised side panel with a heading and a resize line.', use: 'SidePanel' },
  ],
  rules: [
    'Pass ListItemRow rows as children.',
    'Pass the top button as action: it shows in the head and stays at the top of the folded rail.',
    'Pass rail for the icons the folded rail shows under the button.',
    'Hold the fold with useStoredFold, so the action can open the panel before it acts.',
    'Make the row that holds it a positioned list-panel-row container: under 640 px an open panel lies over the work area.',
  ],
  a11y: ['It is an aside named by its title; the fold button says Hide or Show and the title.'],
  buildingBlock: true,
  example: `import { Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { ListPanel, useStoredFold } from '@app/compounds/ListPanel';

const Mounted = () => {
  const fold = useStoredFold('example.list', false);
  const add = <IconButton variant="ghost" size="sm" label="Add" onClick={fold.expand}><Icon name="plus" /></IconButton>;
  return (
    <ListPanel title="Items" action={add} rail={null} collapsed={fold.collapsed} onToggle={fold.toggle}>
      <ListItemRow name="First" meta="One item" />
    </ListPanel>
  );
};
`,
  propsHash: '6652ed10fa304579',
} satisfies ComponentUsage;

export { usage };
