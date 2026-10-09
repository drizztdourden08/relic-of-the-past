/* @layer renderer-components @kind types */
import type { HudFlexContainer, HudGridContainer } from '@shared/types/hud';

type PatchGrid = (patch: Partial<HudGridContainer>) => void;
type PatchFlex = (patch: Partial<HudFlexContainer>) => void;

export type { PatchFlex, PatchGrid };
