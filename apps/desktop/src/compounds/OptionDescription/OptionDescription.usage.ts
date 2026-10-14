/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The description of a randomizer option, with its details and links.',
  useWhen: ['Under the label of an option row.'],
  avoidWhen: [{ case: 'Plain running text.', use: 'Text' }],
  rules: ['Pass the description object the option catalog holds.'],
  a11y: ['Links inside it are real links.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { OptionDescription } from '@app/compounds/OptionDescription';

const Mounted = (props: ComponentProps<typeof OptionDescription>) => <OptionDescription {...props} />;
`,
  propsHash: '86630f6d8acf5dbe',
} satisfies ComponentUsage;

export { usage };
