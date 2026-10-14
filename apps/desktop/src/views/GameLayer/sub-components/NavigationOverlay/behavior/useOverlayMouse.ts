/* @layer renderer-components @kind hook */
import { useRef, useEffect, useState, useCallback } from 'react';
import type React from 'react';
import type { MouseState } from '@app/navigation-overlay/navigation-overlay.type';
import { INITIAL_MOUSE_STATE } from '../NavigationOverlay.constants';

const useOverlayMouse = () => {
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

  return { mouseState, mouseStateRef, handleMouseDown, handleMouseUp, handleContextMenu, handleHoverTile };
};

export { useOverlayMouse };
