/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A small dialog that asks for one name and hands back the trimmed text on confirm.',
  useWhen: ['Naming or renaming something, such as a saved view.'],
  avoidWhen: [{ case: 'A form with more than one field.', use: 'DialogShell' }],
  rules: [
    'Control it with open; it resets to initialValue each time it opens.',
    'The confirm button stays disabled until the name has a character other than a space.',
  ],
  a11y: ['Focus lands in the field on open, Enter confirms, and Escape cancels.'],
  buildingBlock: true,
  example: `import { NameDialog } from '@rotp/design';\n\nconst SaveName = () => <NameDialog open title="Save view" confirmLabel="Save" onConfirm={() => undefined} onCancel={() => undefined} />;\n`,
  propsHash: '5e76b83224fe2d51',
} satisfies ComponentUsage;

export { usage };
