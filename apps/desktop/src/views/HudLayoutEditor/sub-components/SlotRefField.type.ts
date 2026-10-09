/* @layer renderer-components @kind types */
import type { ModernSlot } from '@rotp/game-data';
import type { GlyphPack } from '@rotp/input-mapping';

interface SlotRefFieldProps {
  label?: string;
  value: number;
  onChange: (index: number) => void;
  slots: readonly ModernSlot[];
  glyphPacks: readonly GlyphPack[];
  className?: string;
}

export type { SlotRefFieldProps };
