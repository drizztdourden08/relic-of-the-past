/* @layer renderer-components @kind component */
import { SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { VIEW_OPTIONS } from '../SpriteSheetViewer.constants';
import type { ViewSwitchProps } from '../SpriteSheetViewer.type';

const ViewSwitch = (props: ViewSwitchProps) => {
  const { view, onView } = props;

  return <SegmentedControl value={view} options={VIEW_OPTIONS} onChange={onView} />;
};

export { ViewSwitch };
