/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A short note under the wishing pond controls that says what was imported or why not.',
  useWhen: ['After an import in the wishing pond section.'],
  avoidWhen: [{ case: 'A message that passes.', use: 'Toast' }],
  rules: ['Pass one line for each fact.'],
  a11y: ['The lines are text in reading order.'],
  buildingBlock: true,
  example: `import { PondStatusNote } from '@app/compounds/PondStatusNote';

const Mounted = () => <PondStatusNote lines={['Imported 4 values']} />;
`,
  propsHash: 'eea605441cb98555',
} satisfies ComponentUsage;

export { usage };
