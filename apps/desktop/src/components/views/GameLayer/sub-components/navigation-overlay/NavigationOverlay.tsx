import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigationOverlayStore } from '../../../../../stores/navigation-overlay-store';
import { useGameUIStore } from '../../../../../stores/game-ui-store';
import type { Props, MouseState } from './types';
import { OverlayCanvas } from './OverlayCanvas';
import { TileInspector } from './TileInspector';
import { PathControlsLegend } from './PathControlsLegend';
import { OverlayLegend } from './OverlayLegend';

function NavigationOverlay({ width, height, gameRunning }: Props) {
  const { visible, result } = useNavigationOverlayStore();
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
    <div
      style={{ position: 'absolute', inset: 0, zIndex: 6 }}
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
      <PathControlsLegend />
      <OverlayLegend />
    </div>
  );
}

export { NavigationOverlay };
