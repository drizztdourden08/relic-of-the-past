/* @layer renderer-widgets @kind component */
import type { WidgetMeta } from '@drizztdourden08/brock-react';
import { msg } from '@drizztdourden08/brock-core/i18n';
import { LiveDataInspectorContent } from '@app/views/NavigationWidget';

const meta: WidgetMeta = {
  label: msg('widgets:dataset.label'),
  padding: 'none',
  icon: 'layers',
  order: 6,
  defaultSide: 'left',
  defaultDockedSize: 300,
  defaultFloatingSize: { width: 320, height: 400 },
  context: 'game',
  devOnly: true,
};

const LiveDataInspector = () => <LiveDataInspectorContent />;

export default LiveDataInspector;
export { meta };
