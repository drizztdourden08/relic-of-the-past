/* @layer renderer-components @kind component */
/**
 * Presentational badge for a single input: the icon (keyboard key or controller
 * button) with an optional text label. Accepts either a full InputBinding
 * (resolved via the shared binding-display helpers) or a raw button-icon id.
 * No data or stores.
 */

import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import { Image } from '../../../../design-system/primitives/Image';
import type { InputBinding, ButtonIcon } from '@shared/types/controls';
import { getBindingLabel, getBindingIconUrl } from '@app/lib/input/binding-display';
import { getButtonIconUrl } from '@app/lib/input/button-icons';
import './InputGlyph.css';

interface InputGlyphProps {
  binding?: InputBinding;
  iconId?: string | null;
  label?: string;
  icon?: ButtonIcon | null;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  /** Fallback rendering when there's no icon: a keycap ('key') or plain text ('plain'). */
  fallbackVariant?: 'key' | 'plain';
  fallbackClassName?: string;
  className?: string;
}

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
