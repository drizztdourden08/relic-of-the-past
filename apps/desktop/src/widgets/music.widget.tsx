/* @layer renderer-widgets @kind component */
import type { WidgetMeta } from '@drizztdourden08/brock-react';
import { MusicWidgetContent } from '@app/views/MusicWidget';

const meta: WidgetMeta = {
  label: 'Music Debugger',
  padding: 'none',
  icon: 'headphones',
  order: 8,
  defaultSide: 'right',
  defaultDockedSize: 420,
  defaultFloatingSize: { width: 420, height: 560 },
  context: 'game',
  devOnly: true,
};

const MusicWidget = () => <MusicWidgetContent />;

export default MusicWidget;
export { meta };
