/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The list of parts a patched ROM import read, each marked ok, recovered or failed with its reason.',
  useWhen: ['Under the patched ROM import form, once an import has run.'],
  avoidWhen: [{ case: 'One status word on its own.', use: 'Status' }],
  rules: ['Pass the parts in the order the import reported them.'],
  a11y: ['The rows form a list, and each status is a word, never a colour alone.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { PatchedImportReport } from '@app/compounds/PatchedImportReport';

const Mounted = (props: ComponentProps<typeof PatchedImportReport>) => <PatchedImportReport {...props} />;
`,
  propsHash: '01153b687e377296',
} satisfies ComponentUsage;

export { usage };
