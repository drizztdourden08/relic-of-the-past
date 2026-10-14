/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The list of saved debug capture sessions, with a check box for each, a filter for sent ones and a delete button.',
  useWhen: ['Choosing which capture sessions go into a bug report.'],
  avoidWhen: [{ case: 'Choosing one value from a short list.', use: 'Select' }],
  rules: ['Keep the selection in the caller; the picker only reports toggles.', 'Show the loading state while the sessions are read.'],
  a11y: ['Each session row has a check box with its name.'],
  tree: { path: ['a value the user sets', 'several choices'], rule: 'Several capture sessions to send.' },
  example: `import type { ComponentProps } from 'react';
import { CaptureSessionPicker } from '@app/compounds/CaptureSessionPicker';

const Mounted = (props: ComponentProps<typeof CaptureSessionPicker>) => <CaptureSessionPicker {...props} />;
`,
  propsHash: 'dea4a1f51b15b81c',
} satisfies ComponentUsage;

export { usage };
