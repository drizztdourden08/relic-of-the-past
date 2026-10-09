/* @layer renderer-components @kind component */
import { Box, Status, Tag, Text } from '@drizztdourden08/tessera/primitives';
import type { OptionValueTagProps } from './OptionValueTag.type';
import './OptionValueTag.css';

const OptionValueTag = (props: OptionValueTagProps) => {
  const { value, label, compact = false, className = '' } = props;

  return (
    <Box
      as="span"
      className={`option-value-tag${className ? ` ${className}` : ''}`}
      data-compact={compact ? '' : undefined}
    >
      {label !== undefined && <Text as="span" className="option-value-tag__label">{label}</Text>}
      {typeof value === 'boolean'
        ? <Status tone={value ? 'success' : 'neutral'} variant="pill" dot>{value ? 'True' : 'False'}</Status>
        : <Tag>{String(value)}</Tag>}
    </Box>
  );
};

export { OptionValueTag };
