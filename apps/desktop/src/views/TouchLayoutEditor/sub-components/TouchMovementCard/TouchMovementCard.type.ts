/* @layer renderer-app @kind types */
import type { MovementType } from '@rotp/features';

interface TouchMovementCardProps {
  type: MovementType;
  scale: number;
  onType: (type: MovementType) => void;
  onScale: (scale: number) => void;
}

export type { TouchMovementCardProps };
