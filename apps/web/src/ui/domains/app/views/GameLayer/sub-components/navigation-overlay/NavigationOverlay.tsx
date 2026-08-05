/* @layer renderer-components @kind component */
import { useRef, useEffect, useState, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { Box } from '../../../../../../design-system/primitives/Box';
import { useNavigationOverlayStore } from '../../../../../../../stores/navigation-overlay-store';
import { useGameUIStore } from '../../../../../../../stores/game-ui-store';
import type { Props, MouseState } from './navigation-overlay.type';
import { OverlayCanvas } from './OverlayCanvas';
import { TileInspector } from './TileInspector';
import { PathControlsLegend } from './PathControlsLegend';
import { OverlayLegend } from './OverlayLegend';
import { DotLegend } from './DotLegend';
import { ArrowLegend } from './ArrowLegend';

const IL: Record<string, CSSProperties> = {
  overlay: { position: 'absolute', inset: 0, zIndex: 6 },
  // Controls go top-left; the two legends sit side by side bottom-right. Both
  // containers are pointer-events:none so the overlay never eats a game click —
  // each panel re-enables pointer events for its own collapse chevron.
  controls: { position: 'absolute', top: 6, left: 6, zIndex: 7, pointerEvents: 'none' },
  legends: {
    position: 'absolute', bottom: 6, right: 6, zIndex: 7,
    display: 'flex', gap: 6, alignItems: 'flex-end', pointerEvents: 'none',
  },
  // Arrows sit directly above the on-screen list, in the right-hand column.
  legendColumn: { display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch' },
};

const NavigationOverlay = ({ width, height, gameRunning }: Props) => {
  const { visible, result, annotations } = useNavigationOverlayStore();
  const { overworldScreenIndex, roomIndex, isIndoors } = useGameUIStore(s => s.map);

  const [mouseState, setMouseState] = useState<MouseState>({
    leftHeld: false,
    lockTarget: false,
    hoverTile: null,
    lockedTile: null,
  });
  const mouseStateRef = useRef(mouseState);

  useEffect(() => {
    mouseStateRef.current = mouseState;
  }, [mouseState]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 0) {
      setMouseState(s => s.lockTarget ? { ...s, leftHeld: true, lockTarget: false, lockedTile: null } : { ...s, leftHeld: true });
    }
    if (e.button === 2) {
      setMouseState(s => (s.leftHeld && s.hoverTile)
        ? { ...s, lockTarget: true, lockedTile: s.hoverTile }
        : s);
    }
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 0) {
      setMouseState(s => s.lockTarget
        ? { ...s, leftHeld: false }
        : { ...s, leftHeld: false, lockedTile: null });
    }
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleHoverTile = useCallback((row: number, col: number) => {
    setMouseState(s => ({
      ...s,
      hoverTile: row >= 0 && col >= 0 ? { row, col } : null,
    }));
  }, []);

  if (!visible || !result) return null;

  return (
    <Box
      style={IL.overlay}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      <OverlayCanvas
        width={width}
        height={height}
        gameRunning={gameRunning}
        mouseStateRef={mouseStateRef}
      />
      {result.attrGrid && (
        <TileInspector
          width={width}
          height={height}
          result={result}
          overworldScreenIndex={overworldScreenIndex}
          roomIndex={roomIndex}
          isIndoors={isIndoors}
          onHoverTile={handleHoverTile}
          pathPreviewState={mouseState}
        />
      )}
      <Box style={IL.controls}>
        <PathControlsLegend />
      </Box>
      <Box style={IL.legends}>
        <DotLegend />
        <Box style={IL.legendColumn}>
          <ArrowLegend />
          <OverlayLegend annotations={annotations} />
        </Box>
      </Box>
    </Box>
  );
};

export { NavigationOverlay };
