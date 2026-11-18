/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import type { ViewerControlsProps } from '../SpriteSheetViewer.type';
import { PlaybackControls } from './PlaybackControls';
import { ViewSwitch } from './ViewSwitch';
import { ZoomControl } from './ZoomControl';

const ViewerControls = (props: ViewerControlsProps) => {
  const { view, clock, scale, onView, onScale, labels } = props;

  return (
    <Box className="sprite-viewer__controls">
      <ViewSwitch view={view} onView={onView} labels={labels} />
      <PlaybackControls clock={clock} labels={labels} />
      <ZoomControl scale={scale} onScale={onScale} labels={labels} />
    </Box>
  );
};

export { ViewerControls };
