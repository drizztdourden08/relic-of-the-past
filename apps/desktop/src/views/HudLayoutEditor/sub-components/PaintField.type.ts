/* @layer renderer-components @kind types */
import type { Paint } from '@rotp/hud';

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
