/* @layer renderer-components @kind component */
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
