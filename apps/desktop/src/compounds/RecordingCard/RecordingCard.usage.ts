/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'One debug recording as a card, with its preview, a box to include it in a report, and a delete button.',
  useWhen: ['Listing the recordings a bug report can carry.'],
  avoidWhen: [{ case: 'A plain picture or video.', use: 'Image' }],
  rules: [
    'The callbacks only ask. The view confirms a delete with a dialog before it acts.',
    'A recording sent in an earlier report shows a Sent tag.',
  ],
  a11y: ['The checkbox and the delete button are labelled, and the preview is decoration.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { RecordingCard } from '@app/compounds/RecordingCard';

const Mounted = (props: ComponentProps<typeof RecordingCard>) => <RecordingCard {...props} />;
`,
  propsHash: '653e9f710b1d3f84',
} satisfies ComponentUsage;

export { usage };
