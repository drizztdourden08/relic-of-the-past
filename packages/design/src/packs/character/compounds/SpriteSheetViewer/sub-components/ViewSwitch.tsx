/* @layer renderer-components @kind component */
import { SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { viewOptionsOf } from '../SpriteSheetViewer.constants';
import { viewerLabelsOf } from '../behavior/viewer-labels-of';
import type { ViewSwitchProps } from '../SpriteSheetViewer.type';

const ViewSwitch = (props: ViewSwitchProps) => {
  const { view, onView, labels } = props;

  return <SegmentedControl value={view} options={viewOptionsOf(viewerLabelsOf(labels))} onChange={onView} />;
};

export { ViewSwitch };
