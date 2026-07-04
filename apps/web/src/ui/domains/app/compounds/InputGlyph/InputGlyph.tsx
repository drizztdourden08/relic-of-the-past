/* @layer renderer-components @kind component */
/**
 * InputGlyph — presentational badge for a single input binding: its icon (keyboard
 * key or controller button) with an optional text label. Resolves icon + label via
 * the shared binding-display helpers. Bare/presentational — no data or stores.
 */

import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import { Image } from '../../../../design-system/primitives/Image';
import type { InputBinding, ButtonIcon } from '@shared/types/controls';
import { getBindingLabel, getBindingIconUrl } from '@app/lib/input/binding-display';
import './InputGlyph.css';

interface InputGlyphProps {
  binding: InputBinding;
  icon?: ButtonIcon | null;
  showLabel?: boolean;
  className?: string;
}

const InputGlyph = (props: InputGlyphProps) => {
  const { binding, icon = null, showLabel = true, className = '' } = props;
  const label = getBindingLabel(binding, icon);
  const iconUrl = getBindingIconUrl(binding, icon);

  return (
    <Box className={`input-glyph ${className}`}>
      {iconUrl ? (
        <Image src={iconUrl} alt={label} className="input-glyph__icon" />
      ) : (
        <Text as="kbd" className="input-glyph__key">{label}</Text>
      )}
      {showLabel && iconUrl && <Text className="input-glyph__label">{label}</Text>}
    </Box>
  );
};

export { InputGlyph };
export type { InputGlyphProps };
