/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The round floating button that opens the bug report, and can be dragged.',
  useWhen: ['Inside the debug floating controls.'],
  avoidWhen: [{ case: 'A plain button on a screen.', use: 'Button' }],
  rules: ['Pass dragging so a drag does not count as a click.'],
  a11y: ['The button has a label and a title.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { DebugReportFloatingButton } from '@app/compounds/DebugReportFloatingButton';

const Mounted = (props: ComponentProps<typeof DebugReportFloatingButton>) => <DebugReportFloatingButton {...props} />;
`,
  propsHash: '954fc61c6f3a8eb8',
} satisfies ComponentUsage;

export { usage };
