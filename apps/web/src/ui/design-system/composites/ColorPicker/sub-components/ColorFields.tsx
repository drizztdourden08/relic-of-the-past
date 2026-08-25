/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box } from '../../../primitives/Box';
import { Text } from '../../../primitives/Text';
import { TextInput } from '../../../primitives/TextInput';
import { ChannelInput } from './ChannelInput';
import { hexToRgb, rgbToHex } from '../behavior/color-math';

interface ColorFieldsProps {
  /** Current colour, `#rrggbb` — the source for the R/G/B fields. */
  value: string;
  onChange: (hex: string) => void;
  /** Hex field text, held as a buffer by the parent so typing is not fought. */
  hexInput: string;
  onHexInput: (raw: string) => void;
  alpha: number;
  onAlphaChange?: (alpha: number) => void;
  disableAlpha: boolean;
}

type Channel = 'r' | 'g' | 'b';

/** Hex and RGBA entry for the current colour. */
const ColorFields = (props: ColorFieldsProps) => {
  const { value, onChange, hexInput, onHexInput, alpha, onAlphaChange, disableAlpha } = props;
  const rgb = hexToRgb(value);

  // Re-read the colour at commit time rather than closing over `rgb`: two channels can be
  // edited in the same tick, and a stale capture would drop the earlier one.
  const commitChannel = useCallback((key: Channel) => (n: number) => {
    onChange(rgbToHex({ ...hexToRgb(value), [key]: n }));
  }, [onChange, value]);

  return (
    <Box className="color-picker__fields">
      <Box className="color-picker__field color-picker__field--hex">
        <Box className="color-picker__hex-box">
          {/* Marks the field as hex without becoming part of the value the user edits. */}
          <Text as="span" className="color-picker__hex-sigil" aria-hidden>#</Text>
          <TextInput
            className="color-picker__hex"
            aria-label="Hex"
            value={hexInput}
            maxLength={6}
            spellCheck={false}
            onChange={(e) => onHexInput(e.target.value.replace(/[^0-9a-f]/gi, ''))}
          />
        </Box>
        <Text as="span" className="color-picker__field-label">HEX</Text>
      </Box>

      <ChannelInput label="R" value={rgb.r} max={255} onCommit={commitChannel('r')} />
      <ChannelInput label="G" value={rgb.g} max={255} onCommit={commitChannel('g')} />
      <ChannelInput label="B" value={rgb.b} max={255} onCommit={commitChannel('b')} />
      {!disableAlpha && onAlphaChange && (
        <ChannelInput
          label="A"
          value={Math.round(alpha * 100)}
          max={100}
          onCommit={(n) => onAlphaChange(n / 100)}
        />
      )}
    </Box>
  );
};

export { ColorFields };
export type { ColorFieldsProps };
