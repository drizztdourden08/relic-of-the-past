/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The music widget: the channels, the counters and the feed of music events.',
  useWhen: ['As the content of the music widget in the dock.'],
  avoidWhen: [{ case: 'A log of lines.', use: 'LogPanel' }],
  rules: ['Mount it as widget content; it reads the music state itself.'],
  a11y: ['Rows are text with their labels.'],
  tree: { path: ['layout', 'panels the user docks and moves'], rule: 'The music state as a dockable widget.' },
  example: `import { MusicWidgetContent } from '@app/views/MusicWidget';

const Mounted = () => <MusicWidgetContent />;
`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
