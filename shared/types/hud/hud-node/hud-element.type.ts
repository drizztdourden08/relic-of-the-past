/* @layer shared-types @kind types */
import type { SdlAxisName, SdlButtonName } from '../../../input/sdl-buttons';
import type { HudButtonSpec } from '../hud-button';
import type { HudCountdownSpec } from '../hud-countdown';
import type { HudShapeSpec } from '../hud-shape';
import type { HudTextSpec } from '../hud-text';
import type { Value } from '../hud-value';
import type { HudBox } from './hud-box.type';
import type { HudNode } from './hud-node.type';

type HudGlyphPosition = SdlButtonName | SdlAxisName | 'DPAD';

interface HudRepeatSpec { type: 'repeat'; count: Value; item?: string; child: HudNode }

interface HudSwitchCase { when: string; node: HudNode }

interface HudSwitchSpec { type: 'switch'; cases: HudSwitchCase[]; otherwise?: HudNode }

type HudElementSpec =
  | { type: 'glyph'; position?: HudGlyphPosition; slot?: number; pack?: string }
  | { type: 'slot'; index: number }
  | { type: 'sprite'; file: string; box?: { w: number; h: number } }
  | { type: 'spacer' }
  | HudTextSpec
  | HudButtonSpec
  | HudShapeSpec
  | HudCountdownSpec
  | HudRepeatSpec
  | HudSwitchSpec;

interface HudElement extends HudBox {
  kind: 'element';
  element: HudElementSpec;
  fit?: 'contain';
}

export type { HudElement, HudElementSpec, HudGlyphPosition, HudRepeatSpec, HudSwitchCase, HudSwitchSpec };
