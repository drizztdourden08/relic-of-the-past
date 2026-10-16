/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The pages of an area as cards in labelled groups, each with its icon, its name and what you do there.',
  useWhen: ['On the home page of an area, to list its pages and open one.'],
  avoidWhen: [{ case: 'A list of items the user adds to or deletes from.', use: 'ItemList' }],
  rules: ['Pass the groups with their items, and open the page the item id names in onOpen.'],
  a11y: ['Each group is a labelled region, and each card title is one button that opens the page.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { DataSections } from '@app/compounds/DataSections';

const Mounted = (props: ComponentProps<typeof DataSections>) => <DataSections {...props} />;
`,
  propsHash: '14e7bf92464e9231',
} satisfies ComponentUsage;

export { usage };
