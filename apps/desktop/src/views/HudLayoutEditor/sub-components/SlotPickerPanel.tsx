/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Anchored, Box, EmptyState, NumberInput, Pressable, Text } from '@drizztdourden08/tessera/primitives';
import { usePickerDismiss } from '@app/compounds/SpritePicker';
import { SlotPickActions } from './SlotPickActions';
import type { SlotPickerPanelProps } from './SlotPickerPanel.type';

const SlotPickerPanel = (props: SlotPickerPanelProps) => {
  const { open, anchorRef, slotNumbers, onClose, onPickItem, onPickGlyph, onPickNumber } = props;
  const [manual, setManual] = useState(1);
  const panelRef = useRef<HTMLDivElement>(null);
  usePickerDismiss({ open, anchorRef, panelRef, onClose });

  if (!open) return null;

  const numbers = [...new Set(slotNumbers)].sort((a, b) => a - b);
  const manualValid = Number.isFinite(manual);

  const pick = (handler: ((index: number) => void) | undefined, index: number): void => {
    handler?.(index);
    onClose();
  };

  return (
    <Anchored ref={panelRef} anchorRef={anchorRef} placement="bottom-start" layer="popover" className="hud-picker-grid">
      <Box className="hud-slot-picker__manual">
        <Text className="hud-slot-picker__label">Any slot</Text>
        <NumberInput size="sm" min={1} value={manual} onChange={setManual} />
        <SlotPickActions
          disabled={!manualValid}
          onPickNumber={onPickNumber && (() => pick(onPickNumber, manual))}
          onPickItem={() => pick(onPickItem, manual)}
          onPickGlyph={() => pick(onPickGlyph, manual)}
        />
      </Box>
      <Box className="hud-slot-picker__rows">
        {numbers.length === 0 ? (
          <EmptyState message="No scheme previewed. Type a slot number above." />
        ) : numbers.map((index) => (
          <Box key={index} className="hud-slot-picker__row">
            {onPickNumber ? (
              <Pressable className="hud-slot-picker__label" onClick={() => pick(onPickNumber, index)}>
                Slot {index}
              </Pressable>
            ) : (
              <>
                <Text className="hud-slot-picker__label">Slot {index}</Text>
                <SlotPickActions
                  index={index}
                  onPickItem={() => pick(onPickItem, index)}
                  onPickGlyph={() => pick(onPickGlyph, index)}
                />
              </>
            )}
          </Box>
        ))}
      </Box>
    </Anchored>
  );
};

export { SlotPickerPanel };
export type { SlotPickerPanelProps } from './SlotPickerPanel.type';
