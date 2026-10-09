/* @layer shared-game @kind logic */
import type { ConfirmVerb, PauseContext, PauseState } from './pause.type';
import { confirmTargetAt } from './confirm-target-at';

const confirmVerbAt = (state: PauseState, ctx: PauseContext): ConfirmVerb | null =>
  confirmTargetAt(state, ctx)?.kind ?? null;

export { confirmVerbAt };
