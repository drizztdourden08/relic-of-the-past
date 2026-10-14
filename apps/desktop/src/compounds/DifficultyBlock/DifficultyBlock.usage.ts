/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The randomizer block that sets the difficulty options, with the tiers they depend on.',
  useWhen: ['In the randomizer settings, as the difficulty section.'],
  avoidWhen: [{ case: 'A section of plain label and control rows.', use: 'FormRow' }],
  rules: ['Pass the difficulty setting and the progressive tiers; it holds no state.'],
  a11y: ['Every control has a visible label.'],
  tree: { path: ['layout', 'a settings screen', 'one section of rows'], rule: 'The difficulty section of the randomizer settings.' },
  example: `import type { ComponentProps } from 'react';
import { DifficultyBlock } from '@app/compounds/DifficultyBlock';

const Mounted = (props: ComponentProps<typeof DifficultyBlock>) => <DifficultyBlock {...props} />;
`,
  propsHash: '4e86876907595895',
} satisfies ComponentUsage;

export { usage };
