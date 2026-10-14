/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The tracker of checks: a summary, search and filters, and the checks grouped in a tree with their status.',
  useWhen: ['In the Checks widget and in the spoiler panel of the randomizer.'],
  avoidWhen: [{ case: 'A flat table of rows to sort.', use: 'Card' }],
  rules: ['Pass the tree and the statuses the tracker hook built.', 'Pass stickyHeader to keep the filters in view while the tree scrolls.'],
  a11y: ['Filters are labelled controls and every group is a keyboard operable tree item.'],
  tree: { path: ['data', 'filters over a collection'], rule: 'The checks of a run, filtered and grouped.' },
  example: `import type { ComponentProps } from 'react';
import { ChecksTracker } from '@app/compounds/ChecksTracker';

const Mounted = (props: ComponentProps<typeof ChecksTracker>) => <ChecksTracker {...props} />;
`,
  propsHash: '8c42a166d344995e',
} satisfies ComponentUsage;

export { usage };
