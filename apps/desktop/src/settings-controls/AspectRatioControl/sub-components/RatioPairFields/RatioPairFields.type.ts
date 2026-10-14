/* @layer renderer-components @kind types */
import type { validateCustomRatio } from '@rotp/game-core';

interface RatioPairFieldsProps {
  w: number;
  h: number;
  check: ReturnType<typeof validateCustomRatio>;
  onWidth: (n: number) => void;
  onHeight: (n: number) => void;
}

export type { RatioPairFieldsProps };
