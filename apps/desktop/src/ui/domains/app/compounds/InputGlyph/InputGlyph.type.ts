/* @layer renderer-components @kind types */
import type { InputBinding, ButtonIcon } from '@rotp/game-data';

interface InputGlyphProps {
  binding?: InputBinding;
  iconId?: string | null;
  label?: string;
  icon?: ButtonIcon | null;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  fallbackVariant?: 'key' | 'plain';
  fallbackClassName?: string;
  className?: string;
}

export type { InputGlyphProps };
