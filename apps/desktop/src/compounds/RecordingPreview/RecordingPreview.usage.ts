/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The preview of one debug recording: a muted loop of its video, or its frames stepped on a timer when it has no video.',
  useWhen: ['In the icon of a recording row.'],
  avoidWhen: [{ case: 'A plain picture or video.', use: 'Image' }],
  rules: ['Pass the session and the label that names the video.'],
  a11y: ['The preview is decoration; the row carries the name.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { RecordingPreview } from '@app/compounds/RecordingPreview';

const Mounted = (props: ComponentProps<typeof RecordingPreview>) => <RecordingPreview {...props} />;
`,
  propsHash: '817a7c2a9bd3c997',
} satisfies ComponentUsage;

export { usage };
