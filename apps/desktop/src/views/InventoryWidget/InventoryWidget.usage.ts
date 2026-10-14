/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The inventory widget: the items the player holds, as a grid.',
  useWhen: ['As the content of the inventory widget in the dock.'],
  avoidWhen: [{ case: 'A list of items with the same few fields.', use: 'ItemList' }],
  rules: ['Mount it as widget content; it reads the inventory itself.'],
  a11y: ['Each slot has the item name as its title.'],
  tree: { path: ['layout', 'panels the user docks and moves'], rule: 'The inventory as a dockable widget.' },
  example: `import { InventoryWidgetContent } from '@app/views/InventoryWidget';

const Mounted = () => <InventoryWidgetContent />;
`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
