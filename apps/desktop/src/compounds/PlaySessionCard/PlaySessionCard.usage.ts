/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'One play session in the list of sessions, with its time, length and the checks it found.',
  useWhen: ['Listing the play sessions of a profile.'],
  avoidWhen: [{ case: 'One fact with a label.', use: 'StatRow' }],
  rules: ['Pass the session record as the store returns it.'],
  a11y: ['The facts are text.'],
  tree: { path: ['data', 'one record, compact and read only'], rule: 'A play session of a profile.' },
  example: `import type { ComponentProps } from 'react';
import { PlaySessionCard } from '@app/compounds/PlaySessionCard';

const Mounted = (props: ComponentProps<typeof PlaySessionCard>) => <PlaySessionCard {...props} />;
`,
  propsHash: '9525679f015eb26f',
} satisfies ComponentUsage;

export { usage };
