/* @layer renderer-widgets @kind component */
import type { WidgetMeta } from '@drizztdourden08/brock-react';
import { CheatsWidgetContent } from '@app/views/CheatsWidget';

const meta: WidgetMeta = {
  label: 'Cheats',
  icon: 'zap',
  order: 3,
  defaultSide: 'right',
  defaultDockedSize: 340,
  defaultFloatingSize: { width: 360, height: 500 },
  context: 'game',
};

const CheatsWidget = () => <CheatsWidgetContent />;

export default CheatsWidget;
export { meta };
