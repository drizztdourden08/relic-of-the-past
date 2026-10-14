/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The opening banner of a profile: its mode, facts, progress, last save and the actions.',
  useWhen: ['At the top of a profile page.'],
  avoidWhen: [{ case: 'A plain header.', use: 'ContentHeader' }],
  rules: ['Pass the facts and progress the profile hooks built.', 'Pass the actions as children of the banner.'],
  a11y: ['The facts are text and the folder and import actions are buttons.'],
  tree: { path: ['layout', 'a ready-made app panel', 'an opening banner with art'], rule: 'The banner of a profile.' },
  example: `import type { ComponentProps } from 'react';
import { ProfileHero } from '@app/compounds/ProfileHero';

const Mounted = (props: ComponentProps<typeof ProfileHero>) => <ProfileHero {...props} />;
`,
  propsHash: 'a98a8edc5a58bb65',
} satisfies ComponentUsage;

export { usage };
