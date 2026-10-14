/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A titled group of randomizer option rows.',
  useWhen: ['Around the rows of one section of the randomizer settings.'],
  avoidWhen: [{ case: 'A group in an ordinary form.', use: 'FormRow' }],
  rules: ['Pass live to mark a group that can change while a game runs.'],
  a11y: ['The group has a visible title.'],
  buildingBlock: true,
  example: `import { RandomizerOptionGroup } from '@app/compounds/RandomizerOptionGroup';

const Mounted = () => <RandomizerOptionGroup title="Items" />;
`,
  propsHash: '6b8237b68ad54d46',
} satisfies ComponentUsage;

export { usage };
