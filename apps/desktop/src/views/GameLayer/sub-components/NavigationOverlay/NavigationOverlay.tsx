/* @layer renderer-components @kind component */
import { useRef, useEffect, useState, useCallback } from 'react';
import type React from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { useNavigationOverlayStore } from '../../../../stores/navigation-overlay-store';
import { useGameUIStore } from '../../../../stores/game-ui-store';
import type { Props, MouseState } from '@app/navigation-overlay/navigation-overlay.type';
import { OverlayCanvas } from './sub-components/OverlayCanvas';
import { TileInspector } from './sub-components/TileInspector';
import { PathControlsLegend } from './sub-components/PathControlsLegend';
import { OverlayLegend } from './sub-components/OverlayLegend';
import { DotLegend } from './sub-components/DotLegend';
import { ArrowLegend } from './sub-components/ArrowLegend';
import { INITIAL_MOUSE_STATE, LAYOUT_STYLES } from './NavigationOverlay.constants';

const NavigationOverlay = ({ width, height, gameRunning }: Props) => {
  const { visible, result, annotations } = useNavigationOverlayStore();
  const { overworldScreenIndex, roomIndex, isIndoors } = useGameUIStore(s => s.map);

  const [mouseState, setMouseState] = useState<MouseState>(INITIAL_MOUSE_STATE);
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
      style={LAYOUT_STYLES.overlay}
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
      <Box style={LAYOUT_STYLES.controls}>
        <PathControlsLegend />
      </Box>
      <Box style={LAYOUT_STYLES.legends}>
        <DotLegend />
        <Box style={LAYOUT_STYLES.legendColumn}>
          <ArrowLegend />
          <OverlayLegend annotations={annotations} />
        </Box>
      </Box>
    </Box>
  );
};

export { NavigationOverlay };
