/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'Load, Overwrite and Delete for one save row, each armed by a first click and run by a second, as on a quick save slot.',
  useWhen: ['In the row actions of the Saves and Auto-saves lists.'],
  avoidWhen: [{ case: 'Actions that run on one click.', use: 'ButtonRow' }],
  rules: [
    'Leave out onOverwrite for a save that cannot be written over, such as an auto-save.',
    'Pass overwriteDisabledReason while no game runs.',
    'Pass a resetKey built from the row data, so new data disarms.',
  ],
  a11y: ['Each button names the save; an armed button says it waits for a second click.'],
  buildingBlock: true,
  example: `import { SaveRowActions } from '@app/compounds/SaveRowActions';

const Mounted = () => (
  <SaveRowActions name="Save 1" resetKey="1" busy={false} onLoad={() => undefined} onOverwrite={() => undefined} onDelete={() => undefined} />
);
`,
  propsHash: '01c574d3bc51e6a5',
} satisfies ComponentUsage;

export { usage };
