/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'One progressive item drawn as a ladder: its rungs in order, each with its sprite and a tick to keep it in the seed, joined by a line, plus how the item is given out.',
  useWhen: ['In the randomizer settings, one per progressive item family.'],
  avoidWhen: [{ case: 'A list of plain toggles with no order between them.', use: 'Checkbox' }],
  rules: ['Pass the ladder model; the ladder holds no state and reports rung and mode changes up.', 'The line between two kept rungs is lit; it is dashed when the item is given out in any order.'],
  a11y: ['Each rung is a check box named after its item.'],
  tree: { path: ['layout', 'a settings screen', 'one section of rows'], rule: 'Inside the tiered items section of the randomizer settings.' },
  example: `import type { ComponentProps } from 'react';
import { ProgressiveLadder } from '@app/compounds/ProgressiveLadder';

const Mounted = (props: ComponentProps<typeof ProgressiveLadder>) => <ProgressiveLadder {...props} />;
`,
  propsHash: 'bdd6015c186cef2d',
} satisfies ComponentUsage;

export { usage };
