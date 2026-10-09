/* @layer renderer-widgets @kind component */
import type { WidgetMeta } from '@drizztdourden08/brock-react';
import { NavigationWidgetContent, NavigationWidgetSettings } from '@app/ui/domains/widgets/navigation';
import { WidgetGate } from '@app/views/WidgetGate';

const meta: WidgetMeta = {
  label: 'Location & Navigation',
  icon: 'compass',
  order: 5,
  defaultSide: 'left',
  defaultDockedSize: 320,
  defaultFloatingSize: { width: 340, height: 460 },
  context: 'game',
  devOnly: true,
  settings: NavigationWidgetSettings,
};

const NavigationWidget = () => <WidgetGate id="navigation"><NavigationWidgetContent /></WidgetGate>;

export default NavigationWidget;
export { meta };
