/* @layer shared-types @kind types */
import type { HudContainer } from './hud-container.type';
import type { HudElement } from './hud-element.type';

type HudNode = HudContainer | HudElement;

export type { HudNode };
