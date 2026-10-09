/* @layer renderer-components @kind types */
import type { Value } from '@shared/types/hud';

interface UseTextValueParams {
  value: Value | string;
  onChange: (next: Value | string) => void;
}

export type { UseTextValueParams };
