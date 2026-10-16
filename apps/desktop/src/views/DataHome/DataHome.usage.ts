/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The body of the data home page under its hero: the pages of the data area, and the storage details.',
  useWhen: ['Under the hero of the data home.'],
  avoidWhen: [{ case: 'The headline facts and actions of a home page.', use: 'Hero' }],
  rules: ['Pass the storage summary from the hero and the open function of the page props.'],
  a11y: ['Both parts are labelled regions under a level 2 heading.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { DataHome } from '@app/views/DataHome';

const Mounted = (props: ComponentProps<typeof DataHome>) => <DataHome {...props} />;
`,
  propsHash: '1ef021ad5b54d4f1',
} satisfies ComponentUsage;

export { usage };
