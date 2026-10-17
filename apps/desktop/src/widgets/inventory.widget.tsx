/* @layer renderer-widgets @kind component */
import type { WidgetMeta } from '@drizztdourden08/brock-react';
import { InventoryWidgetContent, InventoryWidgetSettings } from '@app/views/InventoryWidget';

const meta: WidgetMeta = {
  label: 'Inventory',
  padding: 'none',
  icon: 'package',
  order: 1,
  defaultSide: 'right',
  defaultDockedSize: 320,
  defaultFloatingSize: { width: 320, height: 280 },
  context: 'game',
  settings: InventoryWidgetSettings,
};

const InventoryWidget = () => <InventoryWidgetContent />;

export default InventoryWidget;
export { meta };
