/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { useNavigationOverlayStore } from '../../../../stores/navigation-overlay-store';
import { useGameUIStore } from '../../../../stores/game-ui-store';
import type { Props } from '@app/navigation-overlay/navigation-overlay.type';
import { useOverlayMouse } from './behavior/useOverlayMouse';
import { OverlayCanvas } from './sub-components/OverlayCanvas';
import { TileInspector } from './sub-components/TileInspector';
import { PathControlsLegend } from './sub-components/PathControlsLegend';
import { OverlayLegend } from './sub-components/OverlayLegend';
import { DotLegend } from './sub-components/DotLegend';
import { ArrowLegend } from './sub-components/ArrowLegend';
import './NavigationOverlay.css';

const NavigationOverlay = ({ width, height, gameRunning }: Props) => {
  const { visible, result, annotations } = useNavigationOverlayStore();
  const { overworldScreenIndex, roomIndex, isIndoors } = useGameUIStore(s => s.map);
  const mouse = useOverlayMouse();

  if (!visible || !result) return null;

  return (
    <Box
      className="nav-overlay"
      onMouseDown={mouse.handleMouseDown}
      onMouseUp={mouse.handleMouseUp}
      onContextMenu={mouse.handleContextMenu}
    >
      <OverlayCanvas
        width={width}
        height={height}
        gameRunning={gameRunning}
        mouseStateRef={mouse.mouseStateRef}
      />
      {result.attrGrid && (
        <TileInspector
          width={width}
          height={height}
          result={result}
          overworldScreenIndex={overworldScreenIndex}
          roomIndex={roomIndex}
          isIndoors={isIndoors}
          onHoverTile={mouse.handleHoverTile}
          pathPreviewState={mouse.mouseState}
        />
      )}
      <Box className="nav-overlay__controls">
        <PathControlsLegend />
      </Box>
      <Box className="nav-overlay__legends">
        <DotLegend />
        <Box className="nav-overlay__legend-column">
          <ArrowLegend />
          <OverlayLegend annotations={annotations} />
        </Box>
      </Box>
    </Box>
  );
};

export { NavigationOverlay };
