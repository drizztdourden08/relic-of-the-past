/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The step that shows whether ffmpeg is installed and installs it, with its progress and errors.',
  useWhen: ['In a flow that needs ffmpeg, such as the MSU studio.'],
  avoidWhen: [{ case: 'A job with its own log.', use: 'JobDialog' }],
  rules: ['Pass the tool state; show installing while the install runs.'],
  a11y: ['The install button names its action and errors are text.'],
  tree: { path: ['feedback', 'a long job with steps, a log or a failure'], rule: 'Installing ffmpeg.' },
  example: `import type { ComponentProps } from 'react';
import { FfmpegInstallStep } from '@app/compounds/FfmpegInstallStep';

const Mounted = (props: ComponentProps<typeof FfmpegInstallStep>) => <FfmpegInstallStep {...props} />;
`,
  propsHash: 'b7d15d37fa35cb87',
} satisfies ComponentUsage;

export { usage };
