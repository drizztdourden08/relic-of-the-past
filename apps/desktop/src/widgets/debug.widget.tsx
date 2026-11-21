/* @layer renderer-widgets @kind component */
import type { WidgetMeta } from '@drizztdourden08/brock-react';
import { msg } from '@drizztdourden08/brock-core/i18n';
import { DebugWidgetContent } from '@app/views/DebugWidget';

const meta: WidgetMeta = {
  label: msg('widgets:debug.label'),
  padding: 'none',
  icon: 'radio',
  order: 4,
  defaultSide: 'right',
  defaultDockedSize: 320,
  defaultFloatingSize: { width: 340, height: 500 },
  context: 'game',
  devOnly: true,
};

const DebugWidget = () => <DebugWidgetContent />;

export default DebugWidget;
export { meta };
