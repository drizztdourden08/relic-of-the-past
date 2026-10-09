/* @layer store-site @kind types */
import type { useHomeSettings } from './useHomeSettings';

type Move = -1 | 1;

type HomeSettingsState = ReturnType<typeof useHomeSettings>;

export type { Move, HomeSettingsState };
