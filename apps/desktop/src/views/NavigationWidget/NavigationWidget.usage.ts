/* @layer renderer-widgets @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'Reads the live position of the player into a minimap with its connections, and runs the flood fill that marks the tiles the player can reach.',
  useWhen: ['As the body of the navigation widget.'],
  avoidWhen: [{ case: 'A plain list next to a detail pane.', use: 'ListDetailLayout' }],
  rules: ['Place it once inside a widget; it reads the live game itself and takes no props.'],
  a11y: ['The mode switch and the buttons are real controls; the minimap is a picture and carries its facts in the panels below it.'],
  tree: { path: ['layout', 'panels the user docks and moves'], rule: 'The body of the navigation widget.' },
  example: `import { NavigationWidgetContent } from '@app/views/NavigationWidget';\n\nconst Body = () => <NavigationWidgetContent />;\n`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
