/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import type React from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { useGameUIStore } from '../../../../../stores/game-ui-store';
import { TileTooltipContent } from './TileTooltipContent';
import { RectSelectionView } from './RectSelectionView';
import { mouseEventToTile } from '@app/navigation-overlay/tile-inspector-coords';
import { useDebugHoverTile } from '../behavior/useDebugHoverTile';
import { useRectSelection } from '../behavior/useRectSelection';
import { useTileHover } from '../behavior/useTileHover';
import { useViewportSprites } from '../behavior/useViewportSprites';
import type { TileInspectorProps } from './TileInspector.type';

const TileInspector = ({ width, height, result, roomIndex, isIndoors, onHoverTile, pathPreviewState }: TileInspectorProps) => {
  const palaceIndex = useGameUIStore(s => s.map.palaceIndex);
  const { vpRef, spriteRef } = useViewportSprites();

  const mouseToTile = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => mouseEventToTile({ event: e, vp: vpRef.current, result, width, height, isIndoors }),
    [width, height, result, isIndoors],
  );

  const { rectSel, copied, handleRectMouseDown, handleRectMouseMove, handleRectMouseUp, selectionRect } = useRectSelection({
    mouseToTile, result, width, height, isIndoors, vpRef,
  });

  const selecting = Boolean(rectSel?.active);
  const { tooltip, setTooltip, clearHover, handleMouseMove } = useTileHover({
    width, height, result, roomIndex, isIndoors, palaceIndex, pathPreviewState, onHoverTile,
    rectActive: selecting, handleRectMouseMove, vpRef, spriteRef,
  });
  useDebugHoverTile({ result, width, roomIndex, isIndoors, palaceIndex, vpRef, setTooltip });

  const sizeStyle = useMemo(() => ({ width, height }), [width, height]);

  return (
    <Box
      data-testid="tile-inspector"
      className={selecting ? 'nav-overlay__inspector nav-overlay__inspector--selecting' : 'nav-overlay__inspector'}
      onMouseMove={handleMouseMove}
      onMouseDown={handleRectMouseDown}
      onMouseUp={handleRectMouseUp}
      onMouseLeave={clearHover}
      style={sizeStyle}
    >
      <RectSelectionView selectionRect={selectionRect} rectSel={rectSel} copied={copied} />
      {tooltip && !selecting && <TileTooltipContent tooltip={tooltip} />}
    </Box>
  );
};

export { TileInspector };
