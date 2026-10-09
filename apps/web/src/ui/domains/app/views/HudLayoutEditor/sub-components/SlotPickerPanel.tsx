/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Portal, usePickerPopover, Box, Button, IconButton, NumberInput, Text, EmptyState } from '@drizztdourden08/tessera/primitives';
import type { SlotPickerPanelProps } from './SlotPickerPanel.type';

const SlotPickerPanel = (props: SlotPickerPanelProps) => {
  const { open, anchorRef, slotNumbers, onClose, onPickItem, onPickGlyph, onPickNumber } = props;
  const [manual, setManual] = useState(1);
  const { position, panelRef } = usePickerPopover({ open, anchorRef, onClose, estimatedWidth: 260, estimatedHeight: 320 });

  if (!open) return null;

  const numbers = [...new Set(slotNumbers)].sort((a, b) => a - b);
  const manualValid = Number.isFinite(manual);

  const pick = (handler: ((index: number) => void) | undefined, index: number): void => {
    handler?.(index);
    onClose();
  };

  return (
    <Portal layer="popover">
      <Box
        ref={panelRef}
        className="hud-picker-grid"
        data-drop-up={position?.dropUp ? 'true' : undefined}
        style={position ? { top: position.top, left: position.left } : undefined}
      >
        <Box className="hud-slot-picker__manual">
          <Text className="hud-slot-picker__label">Any slot</Text>
          <NumberInput min={1} value={manual} onChange={setManual} />
          {onPickNumber ? (
            <IconButton
              variant="ghost" size="sm" label="Use this slot number" title="Use this number"
              disabled={!manualValid} onClick={() => pick(onPickNumber, manual)}
            >↵</IconButton>
          ) : (
            <>
              <IconButton
                variant="ghost" size="sm" label="Item placeholder" title="Item placeholder"
                disabled={!manualValid} onClick={() => pick(onPickItem, manual)}
              >▫</IconButton>
              <IconButton
                variant="ghost" size="sm" label="Glyph of this slot" title="Glyph of this slot"
                disabled={!manualValid} onClick={() => pick(onPickGlyph, manual)}
              >◉</IconButton>
            </>
          )}
        </Box>
        <Box className="hud-slot-picker__rows">
          {numbers.length === 0 ? (
            <EmptyState message="No scheme previewed. Type a slot number above." />
          ) : numbers.map((index) => (
            <Box key={index} className="hud-slot-picker__row">
              {onPickNumber ? (
                <Button variant="bare" className="hud-slot-picker__label" onClick={() => pick(onPickNumber, index)}>
                  Slot {index}
                </Button>
              ) : (
                <>
                  <Text className="hud-slot-picker__label">Slot {index}</Text>
                  <IconButton
                    variant="ghost" size="sm" label={`Item placeholder for slot ${index}`} title="Item placeholder"
                    onClick={() => pick(onPickItem, index)}
                  >▫</IconButton>
                  <IconButton
                    variant="ghost" size="sm" label={`Glyph of slot ${index}`} title="Glyph of this slot"
                    onClick={() => pick(onPickGlyph, index)}
                  >◉</IconButton>
                </>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Portal>
  );
};

export { SlotPickerPanel };
export type { SlotPickerPanelProps } from './SlotPickerPanel.type';
