/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The card of an installed Hookshop pack: author, version, license, update, duplicate and uninstall.',
  useWhen: ['At the top of a pack that came from the Hookshop.'],
  avoidWhen: [{ case: 'A pack the player made.', use: 'Card' }],
  rules: ['Pass the update version only when a newer one exists.', 'Uninstall asks for confirmation before it runs.'],
  a11y: ['Every action is a labelled button and the confirmation is a dialog.'],
  tree: { path: ['data', 'one record, compact and read only'], rule: 'The origin of an installed pack.' },
  example: `import type { ComponentProps } from 'react';
import { InstalledOrigin } from '@app/compounds/InstalledOrigin';

const Mounted = (props: ComponentProps<typeof InstalledOrigin>) => <InstalledOrigin {...props} />;
`,
  propsHash: '80e4ced0b5a26968',
} satisfies ComponentUsage;

export { usage };
