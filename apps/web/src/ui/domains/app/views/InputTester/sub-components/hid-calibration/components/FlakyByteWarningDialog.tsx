/* @layer renderer-components @kind component */
/**
 * Warns before button capture starts if any bytes are still moving with
 * nothing touched. This is the most common cause of a bad capture. Lists
 * only the flagged bytes, each with its live movement, and lets the user
 * exclude them (individually or all at once) before proceeding.
 */
import { useEffect, useState } from 'react';
import { DialogShell } from '@ds/composites/DialogShell';
import { Box, Button, Checkbox, Text } from '@ds/primitives';
import type { FlakyByte } from '../flaky-byte-detect';
import './FlakyByteWarningDialog.css';

interface FlakyByteWarningDialogProps {
  open: boolean;
  flakyBytes: FlakyByte[];
  liveRanges: Record<number, number>;
  onExcludeAndContinue: (indices: number[]) => void;
  onContinueAnyway: () => void;
  onCancel: () => void;
}

const FlakyByteWarningDialog = (props: FlakyByteWarningDialogProps) => {
  const { open, flakyBytes, liveRanges, onExcludeAndContinue, onContinueAnyway, onCancel } = props;
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Every flagged byte starts checked: excluding all of them is the
  // recommended action. Resets whenever a fresh check reopens the dialog.
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

  const selectAll = () => setSelected(new Set(flakyBytes.map((b) => b.byteIndex)));

  return (
    <DialogShell
      open={open}
      onClose={onCancel}
      title="Flaky bytes detected"
      actions={
        <>
          <Button variant="tertiary" size="sm" onClick={onContinueAnyway}>Start Anyway</Button>
          <Button variant="primary" size="sm" onClick={() => onExcludeAndContinue(Array.from(selected))} disabled={selected.size === 0}>
            Exclude Selected &amp; Start
          </Button>
        </>
      }
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
