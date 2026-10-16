/* @layer renderer-widgets @kind component */
import type { WidgetMeta } from '@drizztdourden08/brock-react';
import { SimulatorWidgetContent, SimulatorWidgetSettings } from '@app/views/SimulatorWidget';

const meta: WidgetMeta = {
  label: 'Simulator',
  icon: 'play',
  order: 7,
  defaultSide: 'right',
  defaultDockedSize: 360,
  defaultFloatingSize: { width: 380, height: 560 },
  kit: 'dev-tools',
  chrome: 'compact',
  settings: SimulatorWidgetSettings,
};

const SimulatorWidget = () => <SimulatorWidgetContent />;

export default SimulatorWidget;
export { meta };
