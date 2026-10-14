/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A tag that shows a value of an option in read only form.',
  useWhen: ['In read only views of the randomizer settings.'],
  avoidWhen: [{ case: 'A tag the player can remove.', use: 'Tag' }],
  rules: ['Booleans show as yes or no.', 'Pass compact for the narrow form.'],
  a11y: ['The value is written as text.'],
  buildingBlock: true,
  example: `import { OptionValueTag } from '@app/compounds/OptionValueTag';

const Mounted = () => <OptionValueTag value label="Shuffle" />;
`,
  propsHash: '8c558007f2043285',
} satisfies ComponentUsage;

export { usage };
