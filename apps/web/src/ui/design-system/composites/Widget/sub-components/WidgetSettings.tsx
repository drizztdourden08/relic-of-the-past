/* @layer renderer-components @kind component */
/**
 * Settings popover for a widget: position and opacity, plus widget-specific
 * options via children. Portalled and anchored below the gear button.
 */
import { useRef, useEffect, type ReactNode } from 'react';
import { Portal, useAnchorTracking } from '../../../primitives/Portal';
import { Box } from '../../../primitives/Box';
import { Text } from '../../../primitives/Text';
import { Checkbox } from '../../../primitives/Checkbox';
import { SegmentedControl } from '../../../primitives/SegmentedControl';
import { Slider } from '../../../primitives/Slider';
import type { WidgetState, SnapSide, WidgetMode } from '../Widget.type';
import { POSITION_OPTIONS } from '../Widget.constants';

type PositionValue = 'left' | 'right' | 'top' | 'bottom' | 'float';

interface WidgetSettingsProps {
  widget: WidgetState;
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  onChange: (patch: Partial<WidgetState>) => void;
  /** Widget-specific settings rendered below the default ones */
  children?: ReactNode;
}

const PANEL_WIDTH = 240;
const PANEL_HEIGHT = 160;
const EDGE_MARGIN = 8;
const ANCHOR_GAP = 4;

/** Below the gear button, clamped so the panel never hangs off an edge. */
const panelPositionFor = (rect: DOMRect): { top: number; left: number } => {
  let top = rect.bottom + ANCHOR_GAP;
  let left = rect.right - PANEL_WIDTH;
  if (left < EDGE_MARGIN) left = EDGE_MARGIN;
  if (left + PANEL_WIDTH > window.innerWidth - EDGE_MARGIN) {
    left = window.innerWidth - PANEL_WIDTH - EDGE_MARGIN;
  }
  if (top + PANEL_HEIGHT > window.innerHeight - EDGE_MARGIN) {
    top = rect.top - PANEL_HEIGHT - ANCHOR_GAP;
  }
  return { top, left };
};

const WidgetSettings = (props: WidgetSettingsProps) => {
  const { widget, anchorRef, onClose, onChange, children } = props;
  const panelRef = useRef<HTMLDivElement>(null);

  // The panel is portalled and placed in viewport coordinates, so it stays
  // under the gear button only if it is re-measured as things scroll.
  const { position: pos } = useAnchorTracking({
    active: true,
    anchorRef,
    compute: panelPositionFor,
    onOutOfView: onClose,
  });

  // Close on outside click
  useEffect(() => {
    let armed = false;
    const armTimer = setTimeout(() => { armed = true; }, 50);

    const handler = (e: MouseEvent) => {
      if (!armed) return;
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener('pointerdown', handler, true);
    return () => {
      clearTimeout(armTimer);
      document.removeEventListener('pointerdown', handler, true);
    };
  }, [onClose, anchorRef]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const posValue: PositionValue = widget.mode === 'floating' ? 'float' : widget.side;

  return (
    <Portal layer="popover">
      <Box
        ref={panelRef}
        className="widget-settings"
        style={{ position: 'fixed', top: pos?.top ?? 0, left: pos?.left ?? 0, pointerEvents: 'auto' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Default: position */}
        <Box className="widget-settings__row">
          <Text className="widget-settings__label">Position</Text>
          <SegmentedControl
            value={posValue}
            options={POSITION_OPTIONS}
            onChange={(v: PositionValue) => {
              if (v === 'float') {
                onChange({ mode: 'floating' as WidgetMode });
              } else {
                onChange({ mode: 'docked' as WidgetMode, side: v as SnapSide });
              }
              onClose();
            }}
          />
        </Box>

        {/* Default: opacity */}
        <Box className="widget-settings__row">
          <Text className="widget-settings__label">Opacity</Text>
          <Slider
            value={Math.round(widget.opacity * 100)}
            min={0}
            max={100}
            step={5}
            onChange={(v) => onChange({ opacity: v / 100 })}
            showValue
            formatValue={(v) => `${v}%`}
          />
        </Box>

        {/* Default: exclusive (only when docked) */}
        {widget.mode === 'docked' && (
          <Box className="widget-settings__row">
            <Text className="widget-settings__label">Exclusive</Text>
            <Checkbox
              className="widget-settings__toggle"
              checked={widget.exclusive ?? false}
              onChange={(c) => onChange({ exclusive: c })}
              label="Shrink game area"
            />
          </Box>
        )}

        {/* Widget-specific options */}
        {children && (
          <>
            <Box className="widget-settings__separator" />
            {children}
          </>
        )}
      </Box>
    </Portal>
  );
}

export { WidgetSettings };
