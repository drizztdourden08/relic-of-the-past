/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'Covers a game widget with a disabled overlay while the setting it needs is off, with a button that opens that setting.',
  useWhen: ['Around the body of every RotP widget file that reads game data or needs a setting.'],
  avoidWhen: [{ case: 'A setting that is locked in a settings row.', use: 'SettingsRow' }],
  rules: ['Pass the widget id; the gate reads its rule from WIDGET_GATES.'],
  a11y: ['The overlay message names the setting that is off.'],
  tree: { path: ['feedback', 'a note that stays on the page'], rule: 'Between a widget file and its content.' },
  example: `import { WidgetGate } from '@app/views/WidgetGate';\n\nconst Inventory = () => <WidgetGate id="inventory"><span>Items</span></WidgetGate>;\n`,
  propsHash: '417da60627d42a3f',
} satisfies ComponentUsage;

export { usage };
