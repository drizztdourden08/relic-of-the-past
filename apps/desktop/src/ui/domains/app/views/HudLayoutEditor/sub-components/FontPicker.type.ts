/* @layer renderer-components @kind types */
import type { HudFontFamily } from '@shared/types/hud';

interface FontPickerProps {
  family: HudFontFamily;
  size: number;
  weight?: number;
  onChange: (family: HudFontFamily, size: number, weight?: number) => void;
}

export type { FontPickerProps };
