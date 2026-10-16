/* @layer renderer-widgets @kind component */
import type { WidgetMeta } from '@drizztdourden08/brock-react';
import { LiveDataInspectorContent } from '@app/views/NavigationWidget';

const meta: WidgetMeta = {
  label: 'Live Data Inspector',
  icon: 'layers',
  order: 6,
  defaultSide: 'left',
  defaultDockedSize: 300,
  defaultFloatingSize: { width: 320, height: 400 },
  kit: 'dev-tools',
  chrome: 'compact',
};

const LiveDataInspector = () => <LiveDataInspectorContent />;

export default LiveDataInspector;
export { meta };
