/* @layer renderer-components @kind component */
import { useState, useEffect, useCallback } from 'react';
import { Box } from '../../primitives/Box';
import { Text } from '../../primitives/Text';
import { Button } from '../../primitives/Button';
import { ColorSwatch } from '../../primitives/ColorSwatch';
import { PickerWheel } from './sub-components/PickerWheel';
import { ColorFields } from './sub-components/ColorFields';
import { useWheelColor } from './behavior/use-wheel-color';
import './ColorPicker.css';
import type { ColorResult } from 'react-color';
import type { ColorPickerProps } from './ColorPicker.type';

const HEX_RE = /^[0-9a-f]{6}$/i;

/** Colour editor: a saturation/hue/alpha wheel, hex + RGBA fields, and quick-assign swatches. */
const ColorPicker = (props: ColorPickerProps) => {
  const {
    value, onChange, alpha = 1, onAlphaChange, disableAlpha = false,
    title, original, word, snapped = false, onReset, onClose, swatchGroups,
  } = props;

  const { seed, beginDrag, followWheel } = useWheelColor(value, alpha, disableAlpha);

  // The hex field needs its own editing buffer: it is fully controlled by `value`, a
  // keystroke re-renders the parent, and the parent hands back a value computed from what
  // it just received. A field showing "8" given a "4" keystroke does not re-render cleared
  // first, so the leftover "8" and the fresh "4" can end up concatenated — which is how
  // typing "42" once produced "042". Re-sync only on a change from OUTSIDE the field.
  const [hexInput, setHexInput] = useState(value.replace('#', ''));
  useEffect(() => setHexInput(value.replace('#', '')), [value]);

  const commitHex = useCallback((raw: string) => {
    setHexInput(raw);
    if (HEX_RE.test(raw)) onChange(`#${raw}`);
  }, [onChange]);

  const handleWheelChange = useCallback((c: ColorResult) => {
    // Hand the wheel straight back what it just produced, before the consumer has had a
    // chance to quantise it — see use-wheel-color for why that is what keeps the pointer
    // under the cursor.
    followWheel(c.hsl);
    onChange(c.hex);
    if (!disableAlpha && onAlphaChange && c.rgb.a !== undefined) onAlphaChange(c.rgb.a);
  }, [followWheel, onChange, onAlphaChange, disableAlpha]);

  return (
    <Box className="color-picker">
      {title && <Text className="color-picker__title">{title}</Text>}

      {/* Capture phase, and on the wrapper rather than inside each of the three strips:
          the flag has to be set before react-color's own mousedown handler runs, or the
          initial click of a drag snaps to the quantised colour before tracking begins. */}
      <Box className="color-picker__wheel" onMouseDownCapture={beginDrag}>
        <PickerWheel color={seed} onChange={handleWheelChange} disableAlpha={disableAlpha} />
      </Box>

      <Box className="color-picker__hex-row">
        <ColorSwatch color={value} className="color-picker__swatch" disabled />
        <ColorFields
          value={value}
          onChange={onChange}
          hexInput={hexInput}
          onHexInput={commitHex}
          alpha={alpha}
          onAlphaChange={onAlphaChange}
          disableAlpha={disableAlpha}
        />
      </Box>

      <Box className="color-picker__meta">
        {word !== undefined && (
          <Text className="color-picker__word">0x{word.toString(16).padStart(4, '0').toUpperCase()}</Text>
        )}
        {snapped && <Text className="color-picker__snap">snapped</Text>}
        {original && original !== value && (
          <Box className="color-picker__original">
            <ColorSwatch color={original} aria-label={`Original ${original}`} disabled />
            <Text className="color-picker__original-hex">was {original}</Text>
          </Box>
        )}
      </Box>

      {swatchGroups && swatchGroups.length > 0 && (
        <Box className="color-picker__quick-assign-section">
          <Text className="color-picker__title">Quick assign</Text>
          <Box className="color-picker__quick-assign">
            {swatchGroups.map((group) => (
              <Box key={group.label} className="color-picker__quick-group">
                <Text className="color-picker__quick-label">{group.label}</Text>
                <Box className="color-picker__quick-swatches">
                  {group.colors.map((hex, i) => (
                    <ColorSwatch
                      key={`${hex}-${i}`}
                      color={hex}
                      className="color-picker__quick-swatch"
                      title={hex}
                      selected={hex.toLowerCase() === value.toLowerCase()}
                      onClick={() => onChange(hex)}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <Box className="color-picker__actions">
        {onReset && <Button variant="secondary" size="sm" onClick={onReset}>Reset</Button>}
        {onClose && <Button variant="primary" size="sm" onClick={onClose}>Done</Button>}
      </Box>
    </Box>
  );
};

export { ColorPicker };
