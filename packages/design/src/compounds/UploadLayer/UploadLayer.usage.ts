/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The upload layer of a site: the tray of running uploads, the progress dialog of the open one, a leave warning while bytes move and the restore of uploads after a reload.',
  useWhen: ['Once, in the frame of a site that uploads files, with the upload queue of that site.'],
  avoidWhen: [{ case: 'One upload row inside a list.', use: 'ListItemRow' }],
  rules: [
    'Pass the queue controls of the site; do not mount a second layer for the same queue.',
    'Start uploads through the queue and let this layer show them.',
  ],
  a11y: ['The tray is a labelled section and the dialog traps focus until it is closed.'],
  buildingBlock: true,
  example: `import { UploadLayer } from '@rotp/design';\nimport type { UploadQueueControls } from '@rotp/hub-client';\n\nconst Uploads = ({ queue }: { queue: UploadQueueControls }) => <UploadLayer queue={queue} />;\n`,
  propsHash: '0b24af4f26ab104b',
} satisfies ComponentUsage;

export { usage };
