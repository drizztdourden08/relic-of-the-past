/* @layer renderer-components @kind component */
import { useState, useEffect, useCallback } from 'react';
import { Box } from '../../../primitives/Box';
import { Text } from '../../../primitives/Text';
import { TextInput } from '../../../primitives/TextInput';

interface ChannelInputProps {
  /** Single-letter channel name, shown under the field and used as its accessible name. */
  label: string;
  value: number;
  max: number;
  onCommit: (n: number) => void;
}

/** One numeric colour channel, captioned. */
const ChannelInput = (props: ChannelInputProps) => {
  const { label, value, max, onCommit } = props;

  // Its own editing buffer, for the reason documented on the hex field. Re-sync
  // only on an external change.
  const [buffer, setBuffer] = useState(String(value));
  useEffect(() => setBuffer(String(value)), [value]);

  const handleChange = useCallback((raw: string) => {
    setBuffer(raw);
    const n = Number(raw);
    if (raw === '' || Number.isNaN(n)) return;
    onCommit(Math.min(max, Math.max(0, Math.round(n))));
  }, [max, onCommit]);

  return (
    <Box className="color-picker__field">
      <TextInput
        className="color-picker__channel"
        type="number"
        min={0}
        max={max}
        value={buffer}
        aria-label={label}
        onChange={(e) => handleChange(e.target.value)}
      />
      <Text as="span" className="color-picker__field-label">{label}</Text>
    </Box>
  );
};

export { ChannelInput };
export type { ChannelInputProps };
