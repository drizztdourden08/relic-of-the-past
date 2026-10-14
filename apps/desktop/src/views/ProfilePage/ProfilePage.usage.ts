/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The page of one profile: its name, ROM, dates, asset state and the Start, Switch and Delete actions.',
  useWhen: ['When the player opens a profile.'],
  avoidWhen: [{ case: 'The list of profiles.', use: 'ItemList' }],
  rules: ['Start is disabled until the assets are extracted or while a game runs.'],
  a11y: ['Every action is a labelled button.'],
  tree: { path: ['data', 'one record, compact and read only'], rule: 'One profile.' },
  example: `import type { ComponentProps } from 'react';
import { ProfilePage } from '@app/views/ProfilePage';

const Mounted = (props: ComponentProps<typeof ProfilePage>) => <ProfilePage {...props} />;
`,
  propsHash: '759ad8b50ab04c22',
} satisfies ComponentUsage;

export { usage };
