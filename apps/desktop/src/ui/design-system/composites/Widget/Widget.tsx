/* @layer renderer-components @kind component */
/**
 * Widget — Generic container shell.
 * Renders: titlebar with settings, frame (affected by opacity), content (fully opaque).
 * Handles: docking, floating, drag, resize, hover-to-reveal-frame.
 */
import { useState, useCallback, useRef, useMemo } from 'react';
import { Box } from '../../primitives/Box';
import { Button } from '../../primitives/Button';
import { Text } from '../../primitives/Text';
import type { WidgetState } from './Widget.type';
import { getWidgetDefinition } from './behavior/createWidgetState';
import { useWidgetDrag } from './behavior/useWidgetDrag';
import { useWidgetResize, getDockedResizeEdge } from './behavior/useWidgetResize';
import { WidgetSettings } from './sub-components/WidgetSettings';

interface WidgetProps {
  state: WidgetState;
  onChange: (patch: Partial<WidgetState>) => void;
  onClose: () => void;
  children: React.ReactNode;
  /** Widget-specific settings content rendered inside the settings popover */
  settingsContent?: React.ReactNode;
  /** Computed position/size for docked widgets (set by WidgetManager) */
  dockedStyle?: React.CSSProperties;
}

const Widget = (props: WidgetProps) => {
  const { state, onChange, onClose, children, settingsContent, dockedStyle } = props;
  const [hovered, setHovered] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const gearRef = useRef<HTMLButtonElement>(null);

  const def = getWidgetDefinition(state.id);
  const label = def?.label ?? state.id;

  const frameOpacity = hovered ? 1 : state.opacity;

  // Drag (floating only)
  const handleDragMove = useCallback(
    (x: number, y: number) => onChange({ x, y }),
    [onChange],
  );
  const dragMouseDown = useWidgetDrag({ x: state.x, y: state.y }, handleDragMove);

  // Resize (floating: all edges; docked: thickness edge only)
  const handleResize = useCallback(
    (width: number, height: number, x: number, y: number) => {
      if (state.mode === 'floating') {
        onChange({ width, height, x, y });
      } else {
        // Docked: only update dockedSize (the thickness dimension)
        const side = state.side;
        const newSize = (side === 'left' || side === 'right') ? width : height;
        onChange({ dockedSize: newSize });
      }
    },
    [onChange, state.mode, state.side],
  );
  const { onEdgeMouseDown } = useWidgetResize(
    { width: state.width, height: state.height },
    { x: state.x, y: state.y },
    handleResize,
  );

  // Build class names
  const cls = [
    'widget',
    `widget--${state.mode}`,
    state.mode === 'docked' && `widget--${state.side}`,
  ].filter(Boolean).join(' ');

  // Build inline style
  const style: React.CSSProperties = useMemo(() => {
    const s: React.CSSProperties = {
      '--widget-frame-opacity': frameOpacity,
    } as React.CSSProperties;

    if (state.mode === 'floating') {
      s.left = state.x;
      s.top = state.y;
      s.width = state.width;
      s.height = state.height;
    } else if (dockedStyle) {
      Object.assign(s, dockedStyle);
    }

    return s;
  }, [state.mode, state.x, state.y, state.width, state.height, frameOpacity, dockedStyle]);

  return (
    <Box
      className={cls}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Titlebar */}
      <Box
        className="widget__titlebar"
        onMouseDown={state.mode === 'floating' ? dragMouseDown : undefined}
      >
        <Text className="widget__title">{label}</Text>
        <Box className="widget__titlebar-actions">
          <Button
            variant="bare"
            ref={gearRef}
            className="widget__btn"
            onClick={() => setSettingsOpen((v) => !v)}
            title="Settings"
          >⚙</Button>
          <Button variant="bare" className="widget__btn" onClick={onClose} title="Close">×</Button>
        </Box>
      </Box>

      {/* Content (always fully opaque) */}
      <Box className="widget__content">
        {children}
      </Box>

      {/* Resize handles */}
      {state.mode === 'floating' && (
        <>
          <Box className="widget__resize widget__resize--n" onMouseDown={onEdgeMouseDown('n')} />
          <Box className="widget__resize widget__resize--s" onMouseDown={onEdgeMouseDown('s')} />
          <Box className="widget__resize widget__resize--e" onMouseDown={onEdgeMouseDown('e')} />
          <Box className="widget__resize widget__resize--w" onMouseDown={onEdgeMouseDown('w')} />
          <Box className="widget__resize widget__resize--ne" onMouseDown={onEdgeMouseDown('ne')} />
          <Box className="widget__resize widget__resize--nw" onMouseDown={onEdgeMouseDown('nw')} />
          <Box className="widget__resize widget__resize--se" onMouseDown={onEdgeMouseDown('se')} />
          <Box className="widget__resize widget__resize--sw" onMouseDown={onEdgeMouseDown('sw')} />
        </>
      )}

      {/* Docked resize handle (thickness edge only) */}
      {state.mode === 'docked' && (
        <Box
          className={`widget__resize widget__resize--${getDockedResizeEdge(state.side)}`}
          onMouseDown={onEdgeMouseDown(getDockedResizeEdge(state.side))}
        />
      )}

      {/* Settings popover */}
      {settingsOpen && (
        <WidgetSettings
          widget={state}
          anchorRef={gearRef}
          onClose={() => setSettingsOpen(false)}
          onChange={onChange}
        >
          {settingsContent}
        </WidgetSettings>
      )}
    </Box>
  );
}

export { Widget };
