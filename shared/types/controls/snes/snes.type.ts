/* @layer shared-types @kind types */
import type { SNES_BUTTONS } from './snes.constants';

type SnesButton = (typeof SNES_BUTTONS)[number];

export type { SnesButton };
