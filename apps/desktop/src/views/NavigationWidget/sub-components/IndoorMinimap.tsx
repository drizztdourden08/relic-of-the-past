/* @layer renderer-widgets @kind component */
import { useMemo } from 'react';
import { Icon } from '@iconify/react/offline';
import { landingCrossings, markerCrossings, crossingIcon } from '@rotp/navigation';
import { Box } from '@drizztdourden08/tessera/primitives';
import { wasmGetRoomLayoutInfo } from '../../../game';
import { useNavigationOverlayStore } from '../../../stores/navigation-overlay-store';
import { boundaryDotsOf } from '../behavior/boundary-dots-of';
import { groupByEdge } from '../behavior/group-by-edge';
import { indoorTilePoint } from '../behavior/indoor-tile-point';
import { markerTone } from '../behavior/marker-tone';
import { playerPointOf } from '../behavior/player-point-of';
import { scrollBoundariesOf } from '../behavior/scroll-boundaries-of';
import { IndoorFrameBody } from './IndoorFrameBody';
import { AnnotationLayer } from './AnnotationLayer';
import { IndoorEdgeBadges } from './IndoorEdgeBadges';
import { AVAIL, BORDER_W, FRAME_LEFT, FRAME_TOP, MAP_LEFT, MAP_SIZE, MAP_TOP, MARKER_SIZE } from './IndoorMinimap.constants';
import type { MinimapProps } from './IndoorMinimap.type';
import './IndoorMinimap.css';

const IndoorMinimap = ({ bundle, connections, renderResults, playerPos, roomIndex }: MinimapProps) => {
  const crossings = useNavigationOverlayStore(s => s.crossings);
  const annotations = useNavigationOverlayStore(s => s.annotations);
  const primaryResult = renderResults.find(r => r.screenIndex === bundle.head) ?? renderResults[0];

  const layoutInfo = wasmGetRoomLayoutInfo();
  const scrollBoundaries = useMemo(
    () => scrollBoundariesOf(layoutInfo),
    [layoutInfo?.shape, layoutInfo?.quadrantFullsizeX, layoutInfo?.quadrantFullsizeY],
  );
  const boundaryDots = useMemo(() => boundaryDotsOf(primaryResult, scrollBoundaries), [primaryResult, scrollBoundaries]);
  const byEdge = groupByEdge(connections.filter(c => !c.isIntraRoom));
  const player = playerPointOf(bundle, playerPos);
  const markerBox = (tile: { col: number; row: number }) => {
    const { x, y } = indoorTilePoint(tile.col, tile.row);
    return { left: x - MARKER_SIZE / 2, top: y - MARKER_SIZE / 2, width: MARKER_SIZE, height: MARKER_SIZE };
  };

  return (
    <Box style={{ maxWidth: AVAIL, height: AVAIL }} className="nav-indoor-minimap__root">
      <Box style={{ left: FRAME_LEFT, top: FRAME_TOP, width: MAP_SIZE, height: MAP_SIZE, border: `${BORDER_W}px solid var(--c-secondary-soft)` }} className="nav-indoor-minimap__map-frame">
        <IndoorFrameBody result={primaryResult} />
      </Box>

      {crossings.flatMap(screen => markerCrossings(screen, true).map(crossing => (
        <Box key={`ent-${screen.screenIndex}-${crossing.id}`} style={markerBox(crossing.tile)} title={crossing.label} className="nav-indoor-minimap__marker">
          <Icon icon={crossingIcon(crossing).icon} width={MARKER_SIZE} height={MARKER_SIZE} className="nav-marker-icon nav-marker-icon--shadowed" data-tone={markerTone(crossing)} />
        </Box>
      )))}

      {crossings.flatMap(screen => landingCrossings(screen, true).map(crossing => (
        <Box key={`fh-${screen.screenIndex}-${crossing.id}`} style={markerBox(crossing.tile)} className="nav-indoor-minimap__fall-hole" />
      )))}

      {player && <Box style={{ left: player.x - 3, top: player.y - 3 }} className="nav-indoor-minimap__player-dot" />}

      <AnnotationLayer annotations={annotations.find(a => a.screenIndex === roomIndex) ?? null} cellLeft={MAP_LEFT} cellTop={MAP_TOP} cellW={MAP_SIZE} cellH={MAP_SIZE} />

      <IndoorEdgeBadges byEdge={byEdge} />

      {boundaryDots.map((pt, i) => (
        <Box key={`scroll-boundary-${i}`} style={{ left: pt.x - 1.5, top: pt.y - 1.5, background: pt.color }} className="nav-indoor-minimap__boundary-dot" />
      ))}
    </Box>
  );
};

export { IndoorMinimap };
