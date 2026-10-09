/* @layer renderer-components @kind types */
import type { ModernSlot } from '@shared/types/controls';
import type { GlyphPack } from '@shared/types/hud';

interface SlotRefFieldProps {
  label?: string;
  value: number;
  onChange: (index: number) => void;
  slots: readonly ModernSlot[];
  glyphPacks: readonly GlyphPack[];
  className?: string;
}

export type { SlotRefFieldProps };
