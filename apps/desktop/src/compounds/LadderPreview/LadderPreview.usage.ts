/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A row of chips that previews a capacity ladder, with the jumps between them.',
  useWhen: ['Under the controls of a capacity family.'],
  avoidWhen: [{ case: 'A chart of values.', use: 'Sparkline' }],
  rules: ['Pass chips and jumps of the same ladder.'],
  a11y: ['The chips are text and the ordinal is read before them.'],
  buildingBlock: true,
  example: `import { LadderPreview } from '@app/compounds/LadderPreview';

const Mounted = () => <LadderPreview chips={['1', '3', '5']} jumps={['+2', '+2']} />;
`,
  propsHash: '0d086e75be5ea164',
} satisfies ComponentUsage;

export { usage };
