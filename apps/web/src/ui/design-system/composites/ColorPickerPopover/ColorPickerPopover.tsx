/* @layer renderer-components @kind component */
import { Portal } from '@ds/primitives/Portal';
import { Box } from '@ds/primitives/Box';
import { ColorPicker } from '../ColorPicker';
import { useColorPickerPopover } from './behavior/use-color-picker-popover';
import './ColorPickerPopover.css';
import type { ColorPickerPopoverProps } from './ColorPickerPopover.type';

/**
 * `ColorPicker` as a floating panel anchored to the swatch that opened it.
 * Portalled onto the `popover` layer so the dialog's overflow never clips it,
 * and clamped to both viewport edges.
 */
const ColorPickerPopover = (props: ColorPickerPopoverProps) => {
  const { open, anchorRef, onClose, ...pickerProps } = props;
  const { position, panelRef } = useColorPickerPopover({ open, anchorRef, onClose });

  if (!open) return null;

  return (
    <Portal layer="popover">
      <Box
        ref={panelRef}
        className="color-picker-popover"
        style={position ? { top: position.top, left: position.left } : undefined}
      >
        <ColorPicker {...pickerProps} onClose={onClose} />
      </Box>
    </Portal>
  );
};

export { ColorPickerPopover };
