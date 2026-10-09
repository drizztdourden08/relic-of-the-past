/* @layer renderer-components @kind component */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DialogShell } from '@drizztdourden08/tessera/composites';
import { Box, Button, Checkbox, Text } from '@drizztdourden08/tessera/primitives';
import type { FlakyByteWarningDialogProps } from './FlakyByteWarningDialog.type';
import './FlakyByteWarningDialog.css';

const FlakyByteWarningDialog = (props: FlakyByteWarningDialogProps) => {
  const { open, flakyBytes, liveRanges, onExcludeAndContinue, onContinueAnyway, onCancel } = props;
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (open) setSelected(new Set(flakyBytes.map((b) => b.byteIndex)));
  }, [open, flakyBytes]);

  const toggle = (byteIndex: number, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(byteIndex); else next.delete(byteIndex);
      return next;
    });
  };

  const selectAll = useCallback(() => setSelected(new Set(flakyBytes.map((b) => b.byteIndex))), [flakyBytes]);
  const excludeSelected = useCallback(() => onExcludeAndContinue(Array.from(selected)), [onExcludeAndContinue, selected]);
  const actions = useMemo(() => (
    <>
      <Button variant="tertiary" size="sm" onClick={onContinueAnyway}>Start Anyway</Button>
      <Button variant="primary" size="sm" onClick={excludeSelected} disabled={selected.size === 0}>
        Exclude Selected &amp; Start
      </Button>
    </>
  ), [onContinueAnyway, excludeSelected, selected.size]);

  return (
    <DialogShell
      open={open}
      onClose={onCancel}
      title="Flaky bytes detected"
      actions={actions}
    >
      <Box className="flaky-byte-dialog__desc">
        These bytes are still changing with nothing pressed. Excluding them before
        button capture starts is what avoids a bad reading, the single most common
        cause of one.
      </Box>
      <Box className="flaky-byte-dialog__header-row">
        <Text className="flaky-byte-dialog__count">{flakyBytes.length} flagged</Text>
        <Button variant="tertiary" size="sm" onClick={selectAll}>Select All</Button>
      </Box>
      <Box className="flaky-byte-dialog__list">
        {flakyBytes.map(({ byteIndex, range }) => (
          <Box key={byteIndex} className="flaky-byte-dialog__row">
            <Checkbox
              checked={selected.has(byteIndex)}
              onChange={(checked) => toggle(byteIndex, checked)}
              label={`byte[${byteIndex}]`}
            />
            <Text className="flaky-byte-dialog__range">moving ±{liveRanges[byteIndex] ?? range}</Text>
          </Box>
        ))}
      </Box>
    </DialogShell>
  );
};

export { FlakyByteWarningDialog };
export type { FlakyByteWarningDialogProps };
