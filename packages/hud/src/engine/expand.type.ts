/* @layer shared-hud @kind types */
import type { Scope } from './engine.type';

interface Budget { remaining: number }

interface ExpandState { scope: Scope; budget: Budget; insideRepeat: boolean }

export type { Budget, ExpandState };
