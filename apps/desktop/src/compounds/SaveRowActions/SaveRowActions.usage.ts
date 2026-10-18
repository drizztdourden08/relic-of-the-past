/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'Load and Overwrite over Delete for one save row, as Tessera ArmedIconButtons: the first press morphs the icon and loops it, the second runs the action.',
  useWhen: ['In the row actions of the Saves and Auto-saves lists.'],
  avoidWhen: [{ case: 'Actions that run on one click.', use: 'ButtonRow' }],
  rules: [
    'Leave out onOverwrite for a save that cannot be written over, such as an auto-save.',
    'Pass overwriteDisabledReason while no game runs.',
    'Pass onArmedChange to show the armed action elsewhere in the row, such as a confirm prompt in place of the date.',
  ],
  a11y: ['Each button names the save; an armed button says it waits for a second click.'],
  buildingBlock: true,
  example: `import { SaveRowActions } from '@app/compounds/SaveRowActions';

const Mounted = () => (
  <SaveRowActions name="Save 1" busy={false} onLoad={() => undefined} onOverwrite={() => undefined} onDelete={() => undefined} />
);
`,
  propsHash: 'c3a71b8f83b8eea5',
} satisfies ComponentUsage;

export { usage };
