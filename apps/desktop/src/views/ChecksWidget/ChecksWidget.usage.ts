/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The Checks widget: the check tracker with its settings, docked or popped out.',
  useWhen: ['As the content of the Checks widget in the dock.'],
  avoidWhen: [{ case: 'A tracker inside a screen.', use: 'Widget' }],
  rules: ['Mount it as widget content; it reads the tracker data itself.'],
  a11y: ['The tracker controls are labelled and keyboard operable.'],
  tree: { path: ['layout', 'panels the user docks and moves'], rule: 'The checks tracker as a dockable widget.' },
  example: `import { ChecksWidgetContent } from '@app/views/ChecksWidget';

const Mounted = () => <ChecksWidgetContent />;
`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
