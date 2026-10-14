/* @layer renderer-widgets @kind component */
import type { WidgetMeta } from '@drizztdourden08/brock-react';
import { ChecksWidgetContent, ChecksWidgetSettings } from '@app/views/ChecksWidget';

const meta: WidgetMeta = {
  label: 'Checks',
  icon: 'map',
  order: 2,
  defaultSide: 'right',
  defaultDockedSize: 380,
  defaultFloatingSize: { width: 380, height: 500 },
  context: 'game',
  settings: ChecksWidgetSettings,
};

const ChecksWidget = () => <ChecksWidgetContent />;

export default ChecksWidget;
export { meta };
