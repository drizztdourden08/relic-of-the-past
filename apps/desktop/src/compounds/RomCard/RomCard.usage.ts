/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A ROM in the list of ROMs, with its extraction state and the Extract, Retry and Remove actions.',
  useWhen: ['Listing the ROMs the app knows.'],
  avoidWhen: [{ case: 'A profile.', use: 'Card' }],
  rules: ['Show the state the extraction reports: ready, extracting, failed or idle.'],
  a11y: ['The state is text and every action is a labelled button.'],
  tree: { path: ['data', 'a row in a list, with its actions'], rule: 'A ROM in the list of ROMs.' },
  example: `import type { ComponentProps } from 'react';
import { RomCard } from '@app/compounds/RomCard';

const Mounted = (props: ComponentProps<typeof RomCard>) => <RomCard {...props} />;
`,
  propsHash: '602531bb51aa005c',
} satisfies ComponentUsage;

export { usage };
