/* @layer renderer-components @kind component */
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { Box } from '../../primitives/Box';
import { Text } from '../../primitives/Text';
import { Button } from '../../primitives/Button';
import { ColorSwatch } from '../../primitives/ColorSwatch';
import './ColorPicker.css';
import type { ColorPickerProps } from './ColorPicker.type';

/** Inline colour editor: a wheel, a hex field, and what the value became once stored. */
const ColorPicker = (props: ColorPickerProps) => {
  const { value, onChange, title, original, word, snapped = false, onReset, onClose } = props;

  return (
    <Box className="color-picker">
      <HexColorPicker color={value} onChange={onChange} />
      <Box className="color-picker__side">
        {title && <Text className="color-picker__title">{title}</Text>}
        <HexColorInput className="color-picker__hex" color={value} onChange={onChange} prefixed />
        {word !== undefined && (
          <Text className="color-picker__word">0x{word.toString(16).padStart(4, '0').toUpperCase()}</Text>
        )}
        {snapped && <Text className="color-picker__snap">snapped to hardware</Text>}
        {original && original !== value && (
          <Box className="color-picker__original">
            <ColorSwatch color={original} aria-label={`Original ${original}`} disabled />
            <Text className="color-picker__original-hex">was {original}</Text>
          </Box>
        )}
        <Box className="color-picker__actions">
          {onReset && <Button variant="bare" size="sm" onClick={onReset}>Reset</Button>}
          {onClose && <Button variant="bare" size="sm" onClick={onClose}>Done</Button>}
        </Box>
      </Box>
    </Box>
  );
};

export { ColorPicker };
