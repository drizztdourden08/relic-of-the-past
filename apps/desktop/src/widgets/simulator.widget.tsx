/* @layer renderer-widgets @kind component */
import type { WidgetMeta } from '@drizztdourden08/brock-react';
import { msg } from '@drizztdourden08/brock-core/i18n';
import { SimulatorWidgetContent, SimulatorWidgetSettings } from '@app/views/SimulatorWidget';

const meta: WidgetMeta = {
  label: msg('widgets:simulator.label'),
  padding: 'none',
  icon: 'play',
  order: 7,
  defaultSide: 'right',
  defaultDockedSize: 360,
  defaultFloatingSize: { width: 380, height: 560 },
  context: 'game',
  devOnly: true,
  settings: SimulatorWidgetSettings,
};

const SimulatorWidget = () => <SimulatorWidgetContent />;

export default SimulatorWidget;
export { meta };
