/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A dialog with the steps of the open upload, a meter while the file moves, a note when a kept copy exists and an optional follow-up button.',
  useWhen: ['Inside UploadLayer, to show the upload a person opened from the tray.'],
  avoidWhen: [{ case: 'A dialog that has nothing to do with uploads.', use: 'DialogShell' }],
  rules: [
    'Pass the queue controls; the dialog reads which upload is open from them.',
    'Close it through the queue so the tray and the dialog agree.',
  ],
  a11y: ['It is a modal dialog titled with the upload, and the steps are an ordered list.'],
  buildingBlock: true,
  example: `import { UploadProgressDialog } from '@rotp/design';\nimport type { UploadQueueControls } from '@rotp/hub-client';\n\nconst Progress = ({ queue }: { queue: UploadQueueControls }) => <UploadProgressDialog queue={queue} />;\n`,
  propsHash: '0b24af4f26ab104b',
} satisfies ComponentUsage;

export { usage };
