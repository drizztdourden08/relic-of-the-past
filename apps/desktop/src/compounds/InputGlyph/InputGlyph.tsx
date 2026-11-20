/* @layer renderer-components @kind component */
import { Box, Text, Image } from '@drizztdourden08/tessera/primitives';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { getBindingLabel } from '@rotp/input-mapping';
import { getBindingIconUrl } from '@app/input/binding-display/get-binding-icon-url';
import { getButtonIconUrl } from '@app/input/button-icons/get-button-icon-url';
import { translateKeyLabel } from '@app/input/key-label';
import { useT } from '@drizztdourden08/brock-react';
import type { InputGlyphProps } from './InputGlyph.type';
import { GlyphFallback } from './sub-components/GlyphFallback';
import './InputGlyph.css';

const resolve = (props: InputGlyphProps, t: I18n['t']): { iconUrl: string | null; label: string } => {
  if (props.binding) {
    return {
      iconUrl: getBindingIconUrl(props.binding, props.icon ?? null),
      label: translateKeyLabel(getBindingLabel(props.binding, props.icon ?? null), t),
    };
  }
  return {
    iconUrl: props.iconId ? getButtonIconUrl(props.iconId) : null,
    label: props.label ?? '',
  };
};

const InputGlyph = (props: InputGlyphProps) => {
  const t = useT();
  const { showLabel = true, size = 'md', fallbackVariant = 'key', fallbackClassName = '', className = '' } = props;
  const { iconUrl, label } = resolve(props, t);

  return (
    <Box className={`input-glyph input-glyph--${size} ${className}`}>
      {iconUrl
        ? <Image src={iconUrl} alt={label} className="input-glyph__icon" />
        : <GlyphFallback variant={fallbackVariant} label={label} className={fallbackClassName} />}
      {showLabel && iconUrl && <Text className="input-glyph__label">{label}</Text>}
    </Box>
  );
};

export { InputGlyph };
