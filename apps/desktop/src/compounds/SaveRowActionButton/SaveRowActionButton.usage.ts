/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'One icon only action of a save row that a first press arms and a second press runs, drawing its idle or its armed icon.',
  useWhen: ['In the actions of a Saves or Auto-saves row, through SaveRowActions.'],
  avoidWhen: [
    { case: 'An action that runs on one press.', use: 'IconButton' },
  ],
  rules: [
    'Pass the icon pair of the action; the armed icon is the slot an armed animation goes in.',
    'Drive armed, onPress and onDisarm from one useArmedAction shared by the row.',
  ],
  a11y: ['The button names its action; an armed button says it waits for a second press.'],
  buildingBlock: true,
  example: `import { Icon } from '@drizztdourden08/tessera/primitives';
import { SaveRowActionButton } from '@app/compounds/SaveRowActionButton';

const Mounted = () => (
  <SaveRowActionButton
    label="Load Save 1"
    icons={{ idle: <Icon name="folder-open" />, armed: <Icon name="folder-open" /> }}
    armed={false}
    onPress={() => undefined}
    onDisarm={() => undefined}
  />
);
`,
  propsHash: 'd20070e85dafcfb1',
} satisfies ComponentUsage;

export { usage };
