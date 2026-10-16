/* @layer renderer-widgets @kind component */
import type { WidgetMeta } from '@drizztdourden08/brock-react';
import { NavigationWidgetContent, NavigationWidgetSettings } from '@app/views/NavigationWidget';

const meta: WidgetMeta = {
  label: 'Location & Navigation',
  icon: 'compass',
  order: 5,
  defaultSide: 'left',
  defaultDockedSize: 320,
  defaultFloatingSize: { width: 340, height: 460 },
  kit: 'dev-tools',
  chrome: 'compact',
  settings: NavigationWidgetSettings,
};

const NavigationWidget = () => <NavigationWidgetContent />;

export default NavigationWidget;
export { meta };
