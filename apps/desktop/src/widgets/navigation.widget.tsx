/* @layer renderer-widgets @kind component */
import type { WidgetMeta } from '@drizztdourden08/brock-react';
import { msg } from '@drizztdourden08/brock-core/i18n';
import { NavigationWidgetContent, NavigationWidgetSettings } from '@app/views/NavigationWidget';

const meta: WidgetMeta = {
  label: msg('widgets:navigation.label'),
  padding: 'none',
  icon: 'compass',
  order: 5,
  defaultSide: 'left',
  defaultDockedSize: 320,
  defaultFloatingSize: { width: 340, height: 460 },
  context: 'game',
  devOnly: true,
  settings: NavigationWidgetSettings,
};

const NavigationWidget = () => <NavigationWidgetContent />;

export default NavigationWidget;
export { meta };
