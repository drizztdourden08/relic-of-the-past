/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The card that shows the Hookshop account state: signed out, waiting for the browser, or signed in.',
  useWhen: ['In the settings that tie the app to a Hookshop account.'],
  avoidWhen: [{ case: 'A generic status line.', use: 'Status' }],
  rules: ['Pass the copy for each state; the card holds no wording of its own.', 'Show the user code while the sign in waits.'],
  a11y: ['The sign in, cancel and sign out actions are buttons with text.'],
  tree: { path: ['data', 'one record, compact and read only'], rule: 'The Hookshop account.' },
  example: `import type { ComponentProps } from 'react';
import { HubAccountCard } from '@app/compounds/HubAccountCard';

const Mounted = (props: ComponentProps<typeof HubAccountCard>) => <HubAccountCard {...props} />;
`,
  propsHash: '645d24622737005e',
} satisfies ComponentUsage;

export { usage };
