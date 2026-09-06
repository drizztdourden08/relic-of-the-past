/* @layer renderer-widgets @kind component */
/**
 * Stop-at-check picker. A checks-widget-style popover over the "Stop at check"
 * control. A trigger button shows the current selection (type icon + name);
 * clicking it opens an anchored panel with the shared search / tag / item /
 * status filters and a scrollable, icon-tagged list of checks. Selecting a row
 * (or the "No stop (full run)" row) calls onStopAtChange and closes the panel.
 */
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Box, Button, Portal, Text } from '@ds/primitives';
import { getCheck } from '@shared/game/data';
import type { CheckId } from '@shared/game/data';
import { useStopAtChecks } from '../../behavior/useStopAtChecks';
import { StopAtCheckFilters } from './StopAtCheckFilters';
import { StopAtCheckList } from './StopAtCheckList';
import { checkTypeIcon } from './check-type-icons';
import './StopAtCheckPicker.css';

interface StopAtCheckPickerProps {
  stopAtCheckId: CheckId | '';
  onStopAtChange: (id: CheckId | '') => void;
  disabled: boolean;
}

interface PanelPos {
  top: number;
  left: number;
  width: number;
}

const StopAtCheckPicker = (props: StopAtCheckPickerProps) => {
  const { stopAtCheckId, onStopAtChange, disabled } = props;
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PanelPos | null>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const { filter, setFilter, checks, statuses } = useStopAtChecks();

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  }, [open]);

  const handleSelect = useCallback((id: CheckId | '') => {
    onStopAtChange(id);
    setOpen(false);
  }, [onStopAtChange]);

  const selected = stopAtCheckId ? getCheck(stopAtCheckId) : undefined;
  const triggerIcon = selected ? checkTypeIcon(selected.kind) : '∞';
  const triggerLabel = selected?.randomizerName ?? 'No stop (full run)';

  return (
    <>
      <Button
        ref={anchorRef}
        variant="secondary"
        size="sm"
        fullWidth
        disabled={disabled}
        className="stop-picker__trigger"
        onClick={() => setOpen((v) => !v)}
      >
        <Text className="stop-picker__trigger-icon">{triggerIcon}</Text>
        <Text className="stop-picker__trigger-label">{triggerLabel}</Text>
        <Text className="stop-picker__trigger-caret">{open ? '▴' : '▾'}</Text>
      </Button>

      {open && !disabled && (
        <Portal layer="popover">
          <Box className="stop-picker__backdrop" onClick={() => setOpen(false)} />
          <Box
            className="stop-picker__panel"
            style={pos ? { top: pos.top, left: pos.left, minWidth: pos.width } : undefined}
          >
            <StopAtCheckFilters filter={filter} onFilterChange={setFilter} />
            <StopAtCheckList
              checks={checks}
              selectedId={stopAtCheckId}
              statuses={statuses}
              onSelect={handleSelect}
            />
          </Box>
        </Portal>
      )}
    </>
  );
};

export { StopAtCheckPicker };
