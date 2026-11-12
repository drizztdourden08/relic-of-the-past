/* @layer renderer-app @kind types */
import type { TouchEmit } from '@rotp/features';

interface TouchAddCardProps {
  onPick: (emit: TouchEmit) => void;
}

export type { TouchAddCardProps };
