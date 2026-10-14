/* @layer shared-hud @kind types */
import type { HudAnimation, HudEnterExitTransition, HudTransition } from '../../types/hud-motion';

interface EnumArraySpec<T extends string> {
  allowed: readonly T[];
  allowEmpty?: boolean;
}

interface OptionalAnimationParts {
  when: string | undefined;
  delay: HudAnimation['delay'];
  easing: HudAnimation['easing'];
}

interface TransitionParts {
  easing: HudTransition['easing'];
  when: string | undefined;
  enter: HudEnterExitTransition | undefined;
  exit: HudEnterExitTransition | undefined;
}

export type { EnumArraySpec, OptionalAnimationParts, TransitionParts };
