/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'One randomizer option: its label, description, control and the impact on the item pool.',
  useWhen: ['In the sections of the randomizer settings.'],
  avoidWhen: [{ case: 'A setting outside the randomizer.', use: 'FormRow' }],
  rules: ['The control follows the option kind: toggle, choice, range or text.', 'Locked options show a tag and cannot change.'],
  a11y: ['The control is labelled by the option name.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { RandomizerOptionRow } from '@app/compounds/RandomizerOptionRow';

const Mounted = (props: ComponentProps<typeof RandomizerOptionRow>) => <RandomizerOptionRow {...props} />;
`,
  propsHash: '81c8ac5e2632437e',
} satisfies ComponentUsage;

export { usage };
