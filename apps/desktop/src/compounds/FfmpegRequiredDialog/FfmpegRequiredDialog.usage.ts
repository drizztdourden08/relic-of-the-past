/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A dialog that tells the player ffmpeg is needed and lets them install it.',
  useWhen: ['When an action needs ffmpeg and it is not installed.'],
  avoidWhen: [{ case: 'A question with a yes or no answer.', use: 'Dialog' }],
  rules: ['Control open from the caller and close it with onClose.'],
  a11y: ['It is a dialog with a title and a close button.'],
  tree: { path: ['something over the page', 'a question the user must answer'], rule: 'The ffmpeg required notice.' },
  example: `import { FfmpegRequiredDialog } from '@app/compounds/FfmpegRequiredDialog';

const Mounted = () => <FfmpegRequiredDialog open onClose={() => undefined} />;
`,
  propsHash: 'baf11ca90066e9a4',
} satisfies ComponentUsage;

export { usage };
