/* @layer renderer-components @kind component */
/**
 * The one options panel every widget gets: placement, make room, opacity and
 * visibility, then the widget's own OptionRows, then a reset. Portalled and
 * anchored under the gear button. Bare and presentational: everything comes in
 * through props and leaves through callbacks.
 */
import { useMemo, useRef } from 'react';
import { Portal } from '../../../../primitives/Portal';
import { Box } from '../../../../primitives/Box';
import { Button } from '../../../../primitives/Button';
import { Divider } from '../../../../primitives/Divider';
import { IconButton } from '../../../../primitives/IconButton';
import { SegmentedControl } from '../../../../primitives/SegmentedControl';
import { Slider } from '../../../../primitives/Slider';
import { Text } from '../../../../primitives/Text';
import { Toggle } from '../../../../primitives/Toggle';
import { OPACITY_MAX, OPACITY_MIN, OPACITY_STEP, SHOW_OPTIONS } from './WidgetOptions.constants';
import { panelPositionFor } from './behavior/panel-position';
import { useDismiss } from './behavior/useDismiss';
import { OptionRow } from './sub-components/OptionRow';
import { PlacementRow } from './sub-components/PlacementRow';
import type { WidgetOptionsProps, WidgetShow } from './WidgetOptions.type';
import './WidgetOptions.css';

const WidgetOptions = (props: WidgetOptionsProps) => {
  const {
    title, placement, dockEdge, makeRoom, opacity, show, anchorRect,
    onDock, onFloat, onPopOut, canPopOut = true, onMakeRoomChange, onOpacityChange, onShowChange, onReset, onClose,
    children,
  } = props;
  const panelRef = useRef<HTMLDivElement>(null);

  useDismiss(panelRef, anchorRect, onClose);

  const pos = useMemo(
    () => panelPositionFor(anchorRect, window.innerWidth, window.innerHeight),
    [anchorRect],
  );

  return (
    <Portal layer="popover">
      <Box
        ref={panelRef}
        className="widget-options"
        role="dialog"
        aria-label={`${title} options`}
        style={{ top: pos.top, left: pos.left }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Box className="widget-options__header">
          <Text className="widget-options__title">{title}</Text>
          <IconButton size="sm" variant="ghost" label="Close" onClick={onClose}>
            {'×'}
          </IconButton>
        </Box>

        <Text className="widget-options__section">Placement</Text>
        <PlacementRow
          placement={placement}
          dockEdge={dockEdge}
          onDock={onDock}
          onFloat={onFloat}
          onPopOut={onPopOut}
          canPopOut={canPopOut}
        />

        {placement === 'docked' && (
          <OptionRow label="Make room" hint="The game shrinks to fit this widget">
            <Toggle checked={makeRoom} onChange={onMakeRoomChange} />
          </OptionRow>
        )}

        <OptionRow label="Opacity">
          <Slider
            value={Math.round(opacity * OPACITY_MAX)}
            min={OPACITY_MIN}
            max={OPACITY_MAX}
            step={OPACITY_STEP}
            onChange={(v) => onOpacityChange(v / OPACITY_MAX)}
            showValue
            formatValue={(v) => `${v}%`}
          />
        </OptionRow>

        <OptionRow label="Show">
          <SegmentedControl<WidgetShow> value={show} options={SHOW_OPTIONS} onChange={onShowChange} />
        </OptionRow>

        {children && (
          <>
            <Divider className="widget-options__divider" />
            {children}
          </>
        )}

        <Divider className="widget-options__divider" />
        <Box className="widget-options__footer">
          <Button size="sm" variant="ghost" onClick={onReset}>Reset this widget</Button>
        </Box>
      </Box>
    </Portal>
  );
};

export { WidgetOptions };
