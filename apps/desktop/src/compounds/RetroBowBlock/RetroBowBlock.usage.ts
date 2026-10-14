/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The randomizer block that sets how the retro bow is handled: the arrow rules and the shop.',
  useWhen: ['In the randomizer settings, as the retro bow section.'],
  avoidWhen: [{ case: 'A single toggle.', use: 'Toggle' }],
  rules: ['Pass the capacity profile and the tiers the setting depends on.'],
  a11y: ['Every control has a visible label.'],
  tree: { path: ['layout', 'a settings screen', 'one section of rows'], rule: 'The retro bow section of the randomizer settings.' },
  example: `import type { ComponentProps } from 'react';
import { RetroBowBlock } from '@app/compounds/RetroBowBlock';

const Mounted = (props: ComponentProps<typeof RetroBowBlock>) => <RetroBowBlock {...props} />;
`,
  propsHash: '171b6e28f42fd647',
} satisfies ComponentUsage;

export { usage };
