/* @layer renderer-widgets @kind component */
import type { WidgetMeta } from '@drizztdourden08/brock-react';
import { CheatsWidgetContent } from '@app/ui/domains/widgets/cheats';
import { WidgetGate } from '@app/views/WidgetGate';

const meta: WidgetMeta = {
  label: 'Cheats',
  icon: 'zap',
  order: 3,
  defaultSide: 'right',
  defaultDockedSize: 340,
  defaultFloatingSize: { width: 360, height: 500 },
  context: 'game',
};

const CheatsWidget = () => <WidgetGate id="cheats"><CheatsWidgetContent /></WidgetGate>;

export default CheatsWidget;
export { meta };
