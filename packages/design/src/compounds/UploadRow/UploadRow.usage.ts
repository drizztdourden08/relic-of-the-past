/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'One upload in the tray: its label, its phase, a progress bar, the transfer and time left, a note and the actions that fit its phase.',
  useWhen: ['In the upload tray, one row per job of the queue.'],
  avoidWhen: [{ case: 'A row that is not an upload.', use: 'ListItemRow' }],
  rules: [
    'Pass the job and the four queue actions: open, cancel, dismiss and pick a file.',
    'Clicking the row opens the progress dialog of that job.',
  ],
  a11y: ['The phase is text in a pill and the bar is a live progress bar.'],
  buildingBlock: true,
  example: `import { UploadRow } from '@rotp/design';\nimport type { UploadJob } from '@rotp/hub-client';\n\nconst Row = ({ job }: { job: UploadJob }) => (\n  <UploadRow job={job} onOpen={() => undefined} onCancel={() => undefined} onDismiss={() => undefined} onPickFile={() => undefined} />\n);\n`,
  propsHash: '36cbc258cadc16a2',
} satisfies ComponentUsage;

export { usage };
