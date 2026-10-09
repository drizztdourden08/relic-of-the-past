/* @layer renderer-widgets @kind component */
import type { WidgetMeta } from '@drizztdourden08/brock-react';
import { SimulatorWidgetContent, SimulatorWidgetSettings } from '@app/ui/domains/widgets/simulator';
import { WidgetGate } from '@app/views/WidgetGate';

const meta: WidgetMeta = {
  label: 'Simulator',
  icon: 'play',
  order: 7,
  defaultSide: 'right',
  defaultDockedSize: 360,
  defaultFloatingSize: { width: 380, height: 560 },
  context: 'game',
  devOnly: true,
  settings: SimulatorWidgetSettings,
};

const SimulatorWidget = () => <WidgetGate id="simulator"><SimulatorWidgetContent /></WidgetGate>;

export default SimulatorWidget;
export { meta };
