/* @layer renderer-widgets @kind component */
import type { WidgetMeta } from '@drizztdourden08/brock-react';
import { LiveDataInspectorContent } from '@app/views/NavigationWidget';
import { WidgetGate } from '@app/views/WidgetGate';

const meta: WidgetMeta = {
  label: 'Live Data Inspector',
  icon: 'layers',
  order: 6,
  defaultSide: 'left',
  defaultDockedSize: 300,
  defaultFloatingSize: { width: 320, height: 400 },
  context: 'game',
  devOnly: true,
};

const LiveDataInspector = () => <WidgetGate id="dataset"><LiveDataInspectorContent /></WidgetGate>;

export default LiveDataInspector;
export { meta };
