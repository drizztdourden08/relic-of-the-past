/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The debug widget: the live state of the game, in sections.',
  useWhen: ['As the content of the debug widget in the dock.'],
  avoidWhen: [{ case: 'A log of lines.', use: 'LogPanel' }],
  rules: ['Mount it as widget content; it reads the game state itself.'],
  a11y: ['Rows are text with their labels.'],
  tree: { path: ['layout', 'panels the user docks and moves'], rule: 'The debug state as a dockable widget.' },
  example: `import { DebugWidgetContent } from '@app/views/DebugWidget';

const Mounted = () => <DebugWidgetContent />;
`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
