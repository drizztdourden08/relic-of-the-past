/* @layer renderer-components @kind component */
import { Portal } from '@ds/primitives/Portal';
import { Box } from '@ds/primitives/Box';
import { ColorPicker } from '../ColorPicker';
import { useColorPickerPopover } from './behavior/use-color-picker-popover';
import './ColorPickerPopover.css';
import type { ColorPickerPopoverProps } from './ColorPickerPopover.type';

/**
 * `ColorPicker` as a floating panel anchored to whichever swatch opened it,
 * instead of a block sitting inline in the page pushing everything below it
 * down — a single colour edit used to read as "the picker took over the
 * screen." Portalled onto the `popover` layer (above the dialog it lives
 * inside), so it is never clipped by that dialog's own overflow, and clamped
 * to both viewport edges so it cannot run off screen either.
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
