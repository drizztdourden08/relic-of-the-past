/* @layer renderer-widgets @kind component */
import { Icon } from '@iconify/react/offline';
import { markerCrossings, crossingIcon } from '@rotp/navigation';
import { Box } from '@drizztdourden08/tessera/primitives';
import { useNavigationOverlayStore } from '../../../stores/navigation-overlay-store';
import { cellTone } from '../behavior/cell-tone';
import { groupByEdge } from '../behavior/group-by-edge';
import { markerTone } from '../behavior/marker-tone';
import { overworldCellOrigin } from '../behavior/overworld-cell-origin';
import { overworldGridOf } from '../behavior/overworld-grid-of';
import { CellBody } from './CellBody';
import { OverworldAnnotations } from './OverworldAnnotations';
import { OverworldEdgeBadges } from './OverworldEdgeBadges';
import { MIN_MARKER, TILE_COUNT } from './OverworldMinimap.constants';
import type { MinimapProps } from './IndoorMinimap.type';
import './OverworldMinimap.css';

const OverworldMinimap = ({ bundle, connections, renderResults, playerScreenIndex, playerPos }: MinimapProps) => {
  const grid = overworldGridOf(bundle);
  const crossings = useNavigationOverlayStore(s => s.crossings);
  const annotations = useNavigationOverlayStore(s => s.annotations);
  const byEdge = groupByEdge(connections.filter(c => !c.isIntraRoom));
  const markerSize = Math.max(MIN_MARKER, grid.cellW * 4 / TILE_COUNT);
  const playerSlot = playerPos ? bundle.screens.indexOf(playerPos.screen) : -1;
  const playerOrigin = overworldCellOrigin(grid, playerSlot);

  return (
    <Box style={{ maxWidth: grid.totalW, height: grid.totalH }} className="nav-overworld-minimap__root">
      {bundle.screens.map((scr, idx) => {
        const scrResult = renderResults.find(r => r.screenIndex === scr);
        const { left, top } = overworldCellOrigin(grid, idx);
        return (
          <Box key={scr} style={{ left, top, width: grid.cellW, height: grid.cellH }} className={`nav-overworld-minimap__cell nav-overworld-minimap__cell--${cellTone(playerScreenIndex === scr, scrResult !== undefined)}`}>
            <CellBody bundle={bundle} screen={scr} size={grid.cellW} result={scrResult} />
          </Box>
        );
      })}

      {crossings.flatMap(screen => markerCrossings(screen, false).map(crossing => {
        const slot = bundle.screens.indexOf(screen.screenIndex);
        if (slot < 0) return null;
        const { left, top } = overworldCellOrigin(grid, slot);
        const x = left + (crossing.tile.col / TILE_COUNT) * grid.cellW - markerSize / 2;
        const y = top + (crossing.tile.row / TILE_COUNT) * grid.cellH - markerSize / 2;
        return (
          <Box key={`ent-${screen.screenIndex}-${crossing.id}`} style={{ left: x, top: y, width: markerSize, height: markerSize }} title={crossing.label} className="nav-overworld-minimap__marker">
            <Icon icon={crossingIcon(crossing).icon} width={markerSize} height={markerSize} className="nav-marker-icon nav-marker-icon--shadowed" data-tone={markerTone(crossing)} />
          </Box>
        );
      }))}

      {playerPos && playerSlot >= 0 && (
        <Box
          style={{ left: playerOrigin.left + (playerPos.col / TILE_COUNT) * grid.cellW - 3, top: playerOrigin.top + (playerPos.row / TILE_COUNT) * grid.cellH - 3 }}
          className="nav-overworld-minimap__player-dot"
        />
      )}

      <OverworldAnnotations bundle={bundle} grid={grid} annotations={annotations} />
      <OverworldEdgeBadges bundle={bundle} grid={grid} byEdge={byEdge} />
    </Box>
  );
};

export { OverworldMinimap };
