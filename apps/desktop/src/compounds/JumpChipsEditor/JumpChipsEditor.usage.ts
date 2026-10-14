/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'Edits a list of jump sizes as chips, with a sum that must match the span.',
  useWhen: ['In the custom ladder of a capacity family.'],
  avoidWhen: [{ case: 'One number.', use: 'NumberInput' }],
  rules: ['Pass the span the jumps must add up to and a problem text when they do not.'],
  a11y: ['Each chip field is labelled with its position and each remove button has a label.'],
  buildingBlock: true,
  example: `import { JumpChipsEditor } from '@app/compounds/JumpChipsEditor';

const Mounted = () => <JumpChipsEditor jumps={[2, 3]} span={5} onChange={() => undefined} />;
`,
  propsHash: 'ab1aa63ecbecef4a',
} satisfies ComponentUsage;

export { usage };
