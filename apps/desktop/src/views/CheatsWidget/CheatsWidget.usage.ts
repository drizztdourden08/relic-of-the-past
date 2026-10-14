/* @layer renderer-widgets @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'Edits the running game from a widget: the player, the inventory, the cheat rules and the checks.',
  useWhen: ['As the body of the Cheats widget, in the widget window or the dock.'],
  avoidWhen: [{ case: 'Rows of records to sort and filter.', use: 'DataTable' }],
  rules: ['It takes no props; it reads the game state and the cheat gates itself.'],
  a11y: ['Every tab is a keyboard-reachable tab and every editable value is a labelled control.'],
  tree: { path: ['data', 'a drawing', 'in pixels'], rule: 'The cheats widget.' },
  example: `import { CheatsWidgetContent } from '@app/views/CheatsWidget';\n\nconst Widget = () => <CheatsWidgetContent />;\n`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
