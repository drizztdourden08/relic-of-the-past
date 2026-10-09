/* @layer renderer-components @kind component */
import { Box, Text, Image } from '@drizztdourden08/tessera/primitives';
import { getBindingLabel, getBindingIconUrl } from '@app/lib/input/binding-display';
import { getButtonIconUrl } from '@app/lib/input/button-icons';
import type { InputGlyphProps } from './InputGlyph.type';
import './InputGlyph.css';

const resolve = (props: InputGlyphProps): { iconUrl: string | null; label: string } => {
  if (props.binding) {
    return {
      iconUrl: getBindingIconUrl(props.binding, props.icon ?? null),
      label: getBindingLabel(props.binding, props.icon ?? null),
    };
  }
  return {
    iconUrl: props.iconId ? getButtonIconUrl(props.iconId) : null,
    label: props.label ?? '',
  };
};

const InputGlyph = (props: InputGlyphProps) => {
  const { showLabel = true, size = 'md', fallbackVariant = 'key', fallbackClassName = '', className = '' } = props;
  const { iconUrl, label } = resolve(props);

  return (
    <Box className={`input-glyph input-glyph--${size} ${className}`}>
      {iconUrl ? (
        <Image src={iconUrl} alt={label} className="input-glyph__icon" />
      ) : fallbackVariant === 'plain' ? (
        <Text className={`input-glyph__plain ${fallbackClassName}`}>{label}</Text>
      ) : (
        <Text as="kbd" className={`input-glyph__key ${fallbackClassName}`}>{label}</Text>
      )}
      {showLabel && iconUrl && <Text className="input-glyph__label">{label}</Text>}
    </Box>
  );
};

export { InputGlyph };
export type { InputGlyphProps };
