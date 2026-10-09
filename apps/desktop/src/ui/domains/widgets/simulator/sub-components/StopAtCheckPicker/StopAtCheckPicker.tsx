/* @layer renderer-widgets @kind component */
import { useCallback, useRef, useState } from 'react';
import { Anchored, Box, Button, Portal, Text, useEscapeStack } from '@drizztdourden08/tessera/primitives';
import { getCheck } from '@rotp/game-data';
import type { CheckId } from '@rotp/game-data';
import { useStopAtChecks } from '../../behavior/useStopAtChecks';
import { StopAtCheckFilters } from './StopAtCheckFilters';
import { StopAtCheckList } from './StopAtCheckList';
import { checkTypeIcon } from './behavior/check-type-icon';
import type { StopAtCheckPickerProps } from './StopAtCheckPicker.type';
import './StopAtCheckPicker.css';

const StopAtCheckPicker = (props: StopAtCheckPickerProps) => {
  const { stopAtCheckId, onStopAtChange, disabled } = props;
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const { filter, setFilter, checks, statuses } = useStopAtChecks();
  const close = useCallback(() => setOpen(false), []);
  const shown = open && !disabled;
  useEscapeStack({ level: 'popover', onEscape: close, active: shown });

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
        aria-expanded={shown}
        onClick={() => setOpen((v) => !v)}
      >
        <Text className="stop-picker__trigger-icon">{triggerIcon}</Text>
        <Text className="stop-picker__trigger-label">{triggerLabel}</Text>
        <Text className="stop-picker__trigger-caret">{open ? '▴' : '▾'}</Text>
      </Button>

      {shown && (
        <>
          <Portal layer="popover">
            <Box className="stop-picker__backdrop" onClick={close} />
          </Portal>
          <Anchored anchorRef={anchorRef} placement="bottom-start" layer="popover" className="stop-picker__panel">
            <StopAtCheckFilters filter={filter} onFilterChange={setFilter} />
            <StopAtCheckList
              checks={checks}
              selectedId={stopAtCheckId}
              statuses={statuses}
              onSelect={handleSelect}
            />
          </Anchored>
        </>
      )}
    </>
  );
};

export { StopAtCheckPicker };
