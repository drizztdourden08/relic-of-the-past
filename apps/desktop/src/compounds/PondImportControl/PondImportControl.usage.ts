/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The control that picks a source and imports the wishing pond values from it.',
  useWhen: ['In the wishing pond section, when other sources can supply prices.'],
  avoidWhen: [{ case: 'Choosing one value.', use: 'Select' }],
  rules: ['Disable it while an import runs.'],
  a11y: ['The select has a label and the button names its action.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { PondImportControl } from '@app/compounds/PondImportControl';

const Mounted = (props: ComponentProps<typeof PondImportControl>) => <PondImportControl {...props} />;
`,
  propsHash: 'fca0bcc88507ad79',
} satisfies ComponentUsage;

export { usage };
