/* @layer renderer-widgets @kind component */
import type { WidgetMeta } from '@drizztdourden08/brock-react';
import { MusicWidgetContent } from '@app/ui/domains/widgets/music';
import { WidgetGate } from '@app/views/WidgetGate';

const meta: WidgetMeta = {
  label: 'Music Debugger',
  icon: 'headphones',
  order: 8,
  defaultSide: 'right',
  defaultDockedSize: 360,
  defaultFloatingSize: { width: 380, height: 560 },
  context: 'game',
  devOnly: true,
};

const MusicWidget = () => <WidgetGate id="music"><MusicWidgetContent /></WidgetGate>;

export default MusicWidget;
export { meta };
