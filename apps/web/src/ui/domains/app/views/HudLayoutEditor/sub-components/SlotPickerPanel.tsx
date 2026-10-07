/* @layer renderer-components @kind component */
/**
 * The Slot insert: never a fixed range. A slot number in a layout is not
 * validated against a device. A keyboard alone reaches 107 glyphs, and an
 * author can place slot 40 with nothing plugged in (see
 * `plans/hud-data-binding.html`, "The button object", where the outline flags an
 * out-of-range number as a note, never an error). So this offers the numbers
 * the previewed scheme actually has as a convenience, plus a plain numeric
 * field with no ceiling for anything past that.
 *
 * TWO CALLERS, TWO QUESTIONS (phase 9). The toolbar's Slot insert asks "make
 * me WHICH KIND of object for this number" and so offers two actions per row.
 * `SlotRefField` asks only "which number", for a field that already exists.
 * So `onPickNumber`, when given, collapses each row to one click and hides the
 * pair of kind buttons. One panel, because the list, the uncapped entry and
 * the popover behaviour are the same question either way.
 */
import { useState } from 'react';
import { Portal, usePickerPopover } from '@ds/primitives/Portal';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { IconButton } from '@ds/primitives/IconButton';
import { NumberInput } from '@ds/primitives/NumberInput';
import { Text } from '@ds/primitives/Text';
import { EmptyState } from '@ds/primitives/EmptyState';
import type { RefObject } from 'react';

interface SlotPickerPanelProps {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  /** Slot numbers the previewed scheme currently has. They are a shortcut,
   *  never the only numbers that can be authored. */
  slotNumbers: readonly number[];
  onClose: () => void;
  /** The insert's two kinds. Ignored and not rendered when `onPickNumber`
   *  is given, because a field that already exists is not choosing a kind. */
  onPickItem?: (index: number) => void;
  onPickGlyph?: (index: number) => void;
  /** A field asking only for a number: one click per row. */
  onPickNumber?: (index: number) => void;
}

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
          {/* No `max`, because a slot number is never capped. */}
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
export type { SlotPickerPanelProps };
