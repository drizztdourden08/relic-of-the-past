/* @layer renderer-widgets @kind component */
import type { WidgetMeta } from '@drizztdourden08/brock-react';
import { InventoryWidgetContent, InventoryWidgetSettings } from '@app/views/InventoryWidget';
import { WidgetGate } from '@app/views/WidgetGate';

const meta: WidgetMeta = {
  label: 'Inventory',
  icon: 'package',
  order: 1,
  defaultSide: 'right',
  defaultDockedSize: 320,
  defaultFloatingSize: { width: 320, height: 280 },
  context: 'game',
  settings: InventoryWidgetSettings,
};

const InventoryWidget = () => <WidgetGate id="inventory"><InventoryWidgetContent /></WidgetGate>;

export default InventoryWidget;
export { meta };
