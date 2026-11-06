/* @layer renderer-components @kind types */
import type { ControlsGame } from '@drizztdourden08/brock-input/renderer';

type PresetContext = Parameters<NonNullable<ControlsGame['decoratePreset']>>[1];

export type { PresetContext };
