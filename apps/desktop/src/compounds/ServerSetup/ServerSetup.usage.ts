/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The form that sets the host, port and slot of an Archipelago server, with a test.',
  useWhen: ['When a player connects a run to a server.'],
  avoidWhen: [{ case: 'A form for another record.', use: 'Field' }],
  rules: ['Test the host before the connection starts.', 'Pass actions as children of the form footer.'],
  a11y: ['Each field has a label and the probe result is text.'],
  tree: { path: ['a value the user sets', 'a whole record', 'edit it in place'], rule: 'The server a run connects to.' },
  example: `import type { ComponentProps } from 'react';
import { ServerSetup } from '@app/compounds/ServerSetup';

const Mounted = (props: ComponentProps<typeof ServerSetup>) => <ServerSetup {...props} />;
`,
  propsHash: '42982b349fa06681',
} satisfies ComponentUsage;

export { usage };
