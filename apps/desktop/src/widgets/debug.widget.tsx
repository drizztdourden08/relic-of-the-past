/* @layer renderer-widgets @kind component */
import type { WidgetMeta } from '@drizztdourden08/brock-react';
import { DebugWidgetContent } from '@app/views/DebugWidget';

const meta: WidgetMeta = {
  label: 'Game State',
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
