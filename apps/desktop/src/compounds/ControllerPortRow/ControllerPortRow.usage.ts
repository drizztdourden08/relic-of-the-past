/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'One controller port of the input settings, with its number, its state and its capabilities.',
  useWhen: ['Listing the ports a player can plug a controller into.'],
  avoidWhen: [{ case: 'A row with no device state.', use: 'StatRow' }],
  rules: ['Pass the live hint to say what the player should press.'],
  a11y: ['The port number and the state are read as text.'],
  tree: { path: ['data', 'a row in a list, with its actions'], rule: 'A controller port in the list of ports.' },
  example: `import type { ComponentProps } from 'react';
import { ControllerPortRow } from '@app/compounds/ControllerPortRow';

const Mounted = (props: ComponentProps<typeof ControllerPortRow>) => <ControllerPortRow {...props} />;
`,
  propsHash: '7e4911a6d1846328',
} satisfies ComponentUsage;

export { usage };
