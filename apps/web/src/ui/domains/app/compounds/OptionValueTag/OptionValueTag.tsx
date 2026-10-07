/* @layer renderer-components @kind component */
/**
 * A setting's value drawn as a read-out in place of its control, for an
 * options panel shown read-only. A boolean is a True or False chip, green for
 * true and muted for false, so a switch reads at a glance. Any other value is
 * its own text on a neutral chip. A control that carried its own label keeps
 * it: the label sits before the chip.
 */
import { Box, Chip, Text } from '@ds/primitives';
import type { ChipTone } from '@ds/primitives';
import type { OptionValueTagProps } from './OptionValueTag.type';
import './OptionValueTag.css';

const textOf = (value: OptionValueTagProps['value']): string => {
  if (typeof value !== 'boolean') return String(value);
  return value ? 'True' : 'False';
};

const toneOf = (value: OptionValueTagProps['value']): ChipTone => {
  if (typeof value !== 'boolean') return 'neutral';
  return value ? 'ok' : 'idle';
};

const OptionValueTag = (props: OptionValueTagProps) => {
  const { value, label, compact = false, className = '' } = props;

  return (
    <Box
      as="span"
      className={`option-value-tag${className ? ` ${className}` : ''}`}
      data-compact={compact ? '' : undefined}
    >
      {label !== undefined && <Text as="span" className="option-value-tag__label">{label}</Text>}
      <Chip tone={toneOf(value)}>{textOf(value)}</Chip>
    </Box>
  );
};

export { OptionValueTag };
