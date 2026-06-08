/* @layer renderer-components @kind component */
/**
 * WidgetSettings — Settings popover for a widget.
 * Default options (position, opacity) + widget-specific options via children.
 * Rendered as a portal popover anchored below the gear button.
 */
import { useRef, useLayoutEffect, useState, useEffect, type ReactNode } from 'react';
import { Portal } from '../../../primitives/Portal';
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

const WidgetSettings = (props: WidgetSettingsProps) => {
  const { widget, anchorRef, onClose, onChange, children } = props;
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Position the dropdown below the anchor button, clamped to viewport
  useLayoutEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const panelWidth = 240;
    const panelHeight = 160;
    let top = rect.bottom + 4;
    let left = rect.right - panelWidth;
    if (left < 8) left = 8;
    if (left + panelWidth > window.innerWidth - 8) left = window.innerWidth - panelWidth - 8;
    if (top + panelHeight > window.innerHeight - 8) top = rect.top - panelHeight - 4;
    setPos({ top, left });
  }, [anchorRef]);

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
        style={{ position: 'fixed', top: pos.top, left: pos.left, pointerEvents: 'auto' }}
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
