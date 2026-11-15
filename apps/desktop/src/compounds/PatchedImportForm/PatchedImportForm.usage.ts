/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The form that imports a language from a fan translation patched onto an official release.',
  useWhen: ['In the language studio, to bring in a fan translation from its patched ROM.'],
  avoidWhen: [{ case: 'Reading an official release ROM.', use: 'DropZone' }],
  rules: ['Pass busy while an import runs.', 'Return true from onImport when the set was saved, so the form clears.'],
  a11y: ['Every field has a label, and the error is read out as an alert.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { PatchedImportForm } from '@app/compounds/PatchedImportForm';

const Mounted = (props: ComponentProps<typeof PatchedImportForm>) => <PatchedImportForm {...props} />;
`,
  propsHash: '5401e6525be97d9c',
} satisfies ComponentUsage;

export { usage };
