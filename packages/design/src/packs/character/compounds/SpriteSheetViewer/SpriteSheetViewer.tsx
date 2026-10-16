/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { useWearing } from '../../behavior/useWearing';
import { WearingBar } from '../WearingBar';
import { StateList } from '../StateList';
import { useSpriteViewer } from './behavior/useSpriteViewer';
import { ViewerControls } from './sub-components/ViewerControls';
import { ViewerStage } from './sub-components/ViewerStage';
import type { SpriteSheetViewerProps } from './SpriteSheetViewer.type';
import './SpriteSheetViewer.css';

const SpriteSheetViewer = (props: SpriteSheetViewerProps) => {
  const { sheet, wearing: given, aside, className } = props;
  const own = useWearing();
  const wearing = given ?? own;
  const viewer = useSpriteViewer({ setOutfit: wearing.setOutfit });
  const { view, clock, scale, action, setView, setScale, setAction } = viewer;

  return (
    <Box className={`sprite-viewer${className ? ` ${className}` : ''}`}>
      <WearingBar
        outfit={wearing.outfit}
        gloves={wearing.gloves}
        onOutfit={wearing.setOutfit}
        onGloves={wearing.setGloves}
      />
      <ViewerControls view={view} clock={clock} scale={scale} onView={setView} onScale={setScale} />

      <Box className="sprite-viewer__body">
        {view === 'state' && <StateList selected={action} onSelect={setAction} />}
        <Box className="sprite-viewer__stage">
          <ViewerStage sheet={sheet} wearing={wearing} viewer={viewer} />
        </Box>
        {aside}
      </Box>
    </Box>
  );
};

export { SpriteSheetViewer };
