/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The round floating button that starts and stops a debug capture, and can be dragged.',
  useWhen: ['Inside the debug floating controls.'],
  avoidWhen: [{ case: 'A button that is not draggable.', use: 'Button' }],
  rules: ['Pass the drag handlers the position hook returns.'],
  a11y: ['The button has a label and a title.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { DebugCaptureButton } from '@app/compounds/DebugCaptureButton';

const Mounted = (props: ComponentProps<typeof DebugCaptureButton>) => <DebugCaptureButton {...props} />;
`,
  propsHash: '95999b14a44dd755',
} satisfies ComponentUsage;

export { usage };
