/* @layer renderer-widgets @kind component */
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Box, Button, Portal, Text } from '@drizztdourden08/tessera/primitives';
import { getCheck } from '@shared/game/data';
import type { CheckId } from '@shared/game/data';
import { useStopAtChecks } from '../../behavior/useStopAtChecks';
import { StopAtCheckFilters } from './StopAtCheckFilters';
import { StopAtCheckList } from './StopAtCheckList';
import { checkTypeIcon } from './behavior/check-type-icon';
import type { PanelPos, StopAtCheckPickerProps } from './StopAtCheckPicker.type';
import './StopAtCheckPicker.css';

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
  const triggerLabel = selected?.name ?? 'No stop (full run)';

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
