/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The list side of a data screen: one full width New button above the list of things the screen holds.',
  useWhen: ['In every data screen, such as profiles, languages, ROMs, sprites or MSU packs, as the content of its one list container.'],
  avoidWhen: [{ case: 'A list with no way to add to it.', use: 'ListItemRow' }],
  rules: [
    'Pass the list rows as children; nothing else goes on the list side.',
    'Pass creating while the wizard is open in the detail side, so the button waits for it to close.',
    'Pass available false to hide the button when nothing can be made yet.',
    'Pass notice for a loading row or an error line that sits above the button.',
  ],
  a11y: ['The button names the thing it makes, such as New language.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { CreateListPane } from '@app/compounds/CreateListPane';

const Mounted = (props: ComponentProps<typeof CreateListPane>) => <CreateListPane {...props} />;
`,
  propsHash: '8b068aa5a1458bf3',
} satisfies ComponentUsage;

export { usage };
