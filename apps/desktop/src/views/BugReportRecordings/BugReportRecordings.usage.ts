/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The part of the bug report dialog where the player picks which debug recordings go with the report.',
  useWhen: ['As the section of the bug report dialog while a game session runs with debug logging on.'],
  avoidWhen: [{ case: 'A list of files the player adds by hand.', use: 'DropZone' }],
  rules: [
    'It draws nothing when debug logging is off or no profile is active.',
    'It reports the ticked recordings through setExtras as captureSessions.',
    'Recordings not yet sent start ticked.',
  ],
  a11y: ['Every recording has a labelled checkbox and delete button, and a delete asks first.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { BugReportRecordings } from '@app/views/BugReportRecordings';

const Mounted = (props: ComponentProps<typeof BugReportRecordings>) => <BugReportRecordings {...props} />;
`,
  propsHash: '407943d6b5fcbe50',
} satisfies ComponentUsage;

export { usage };
