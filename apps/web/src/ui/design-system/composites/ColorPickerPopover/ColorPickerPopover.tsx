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
 *
 * `data-drop-up` carries the hook's flip decision to CSS, which shifts the
 * panel up over its own real height AFTER layout: the idiom `Select` and
 * `TagInput` already use. `top` alone cannot express "above the trigger",
 * because the panel's height is not known when `top` is computed; without the
 * transform a flipped panel renders downward from a point above the anchor and
 * draws OVER it.
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
        data-drop-up={position?.dropUp ? 'true' : undefined}
        style={position ? { top: position.top, left: position.left } : undefined}
      >
        <ColorPicker {...pickerProps} onClose={onClose} />
      </Box>
    </Portal>
  );
};

export { ColorPickerPopover };
