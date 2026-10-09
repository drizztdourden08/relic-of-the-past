/* @layer renderer-components @kind types */
import type { Paint } from '@shared/types/hud';

type PaintMode = 'color' | 'gradient' | 'image';

interface PaintFieldProps {
  label?: string;
  value: Paint;
  onChange: (next: Paint) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  kinds?: boolean;
}

export type { PaintFieldProps, PaintMode };
