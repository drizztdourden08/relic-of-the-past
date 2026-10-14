/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A floating tray in the corner that lists the uploads of the queue, folds away and clears the finished ones.',
  useWhen: ['Inside UploadLayer; it shows itself only while the queue holds jobs.'],
  avoidWhen: [{ case: 'The progress of one upload in a dialog.', use: 'DialogShell' }],
  rules: [
    'Pass the queue controls of the site.',
    'Leave it to UploadLayer to mount it, so the leave warning and the restore run too.',
  ],
  a11y: ['It is a labelled section, and the fold button names the action it will take.'],
  buildingBlock: true,
  example: `import { UploadTray } from '@rotp/design';\nimport type { UploadQueueControls } from '@rotp/hub-client';\n\nconst Tray = ({ queue }: { queue: UploadQueueControls }) => <UploadTray queue={queue} />;\n`,
  propsHash: '0b24af4f26ab104b',
} satisfies ComponentUsage;

export { usage };
