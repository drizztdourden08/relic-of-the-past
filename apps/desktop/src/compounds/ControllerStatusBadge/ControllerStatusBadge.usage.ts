/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A badge with the state of one controller: connected, waiting or missing.',
  useWhen: ['Showing the state of a device in a row or a header.'],
  avoidWhen: [{ case: 'A state that is not a controller.', use: 'Status' }],
  rules: ['Pass the device status as the hook returns it.'],
  a11y: ['The state is written as a word.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { ControllerStatusBadge } from '@app/compounds/ControllerStatusBadge';

const Mounted = (props: ComponentProps<typeof ControllerStatusBadge>) => <ControllerStatusBadge {...props} />;
`,
  propsHash: '70d70da497286270',
} satisfies ComponentUsage;

export { usage };
