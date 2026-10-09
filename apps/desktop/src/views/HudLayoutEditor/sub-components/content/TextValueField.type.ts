/* @layer renderer-components @kind types */
import type { Value } from '@rotp/hud';

interface TextValueFieldProps {
  value: Value | string;
  onChange: (next: Value | string) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

export type { TextValueFieldProps };
