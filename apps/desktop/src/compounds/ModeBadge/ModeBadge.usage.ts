/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A round badge that shows the mode of a profile: normal, vanilla or randomizer.',
  useWhen: ['On a profile card or hero.'],
  avoidWhen: [{ case: 'A state word.', use: 'Status' }],
  rules: ['Pass the profile mode id.'],
  a11y: ['The badge carries the mode name as text.'],
  buildingBlock: true,
  example: `import { ModeBadge } from '@app/compounds/ModeBadge';

const Mounted = () => <ModeBadge mode="randomizer" />;
`,
  propsHash: 'f2d09fb596dc0f3b',
} satisfies ComponentUsage;

export { usage };
