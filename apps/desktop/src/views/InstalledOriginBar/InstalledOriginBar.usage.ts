/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The bar above a pack from the Hookshop: its origin, the update, duplicate and uninstall actions.',
  useWhen: ['At the top of a pack page, for an installed pack.'],
  avoidWhen: [{ case: 'A bar for a pack the player made.', use: 'Card' }],
  rules: ['Pass the installed pack and the callbacks for what happened.'],
  a11y: ['Every action is a labelled button.'],
  tree: { path: ['data', 'one record, compact and read only'], rule: 'The origin of an installed pack.' },
  example: `import type { ComponentProps } from 'react';
import { InstalledOriginBar } from '@app/views/InstalledOriginBar';

const Mounted = (props: ComponentProps<typeof InstalledOriginBar>) => <InstalledOriginBar {...props} />;
`,
  propsHash: '82a959a01617c3fd',
} satisfies ComponentUsage;

export { usage };
