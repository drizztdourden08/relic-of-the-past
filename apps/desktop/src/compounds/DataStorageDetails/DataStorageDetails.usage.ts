/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'Where the app keeps its data: the folder and its place, and the count and size of each data folder.',
  useWhen: ['On the data home page, below the highlights.'],
  avoidWhen: [{ case: 'A few labelled values with no folder list.', use: 'FactsPanel' }],
  rules: ['Pass the storage summary, or null with loading while it is read.'],
  a11y: ['The folder path is selectable and has a copy button.'],
  tree: { path: ['data', 'one record, compact and read only'], rule: 'The data folder and its usage.' },
  example: `import type { ComponentProps } from 'react';
import { DataStorageDetails } from '@app/compounds/DataStorageDetails';

const Mounted = (props: ComponentProps<typeof DataStorageDetails>) => <DataStorageDetails {...props} />;
`,
  propsHash: '073f998c1ba57910',
} satisfies ComponentUsage;

export { usage };
