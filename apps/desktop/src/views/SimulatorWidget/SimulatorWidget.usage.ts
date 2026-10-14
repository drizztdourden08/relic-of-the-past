/* @layer renderer-widgets @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'Runs the check simulator on the live game and shows its route, its log, its outcome and the dataset fixes it suggests.',
  useWhen: ['As the body of the Simulator widget, in the widget window or the dock.'],
  avoidWhen: [{ case: 'Rows of records to sort and filter.', use: 'DataTable' }],
  rules: ['It takes no props; it starts, pauses and stops the run itself.'],
  a11y: ['Every control is a labelled button, and the log is a list the keyboard can scroll.'],
  tree: { path: ['data', 'a drawing', 'in pixels'], rule: 'The simulator widget.' },
  example: `import { SimulatorWidgetContent } from '@app/views/SimulatorWidget';\n\nconst Widget = () => <SimulatorWidgetContent />;\n`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
