/* @layer renderer-widgets @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'Shows the data records of the screen the player is on, with their recommendations, side by side with what the live game reports.',
  useWhen: ['As the body of the dataset widget.'],
  avoidWhen: [{ case: 'Browsing every record of a collection.', use: 'ListDetailLayout' }],
  rules: ['Place it once inside a widget; it follows the live game itself and takes no props.'],
  a11y: ['The collection tabs and the review controls answer the keyboard like any tab strip and field.'],
  tree: { path: ['layout', 'panels the user docks and moves'], rule: 'The body of the dataset widget.' },
  example: `import { LiveDataInspectorContent } from '@app/views/LiveDataInspector';\n\nconst Body = () => <LiveDataInspectorContent />;\n`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
