/* @layer shared-types @kind types */
type HudButtonVerb = 'up' | 'down' | 'left' | 'right' | 'pause' | 'map';

type HudButtonBind = { kind: 'verb'; verb: HudButtonVerb } | { kind: 'slot'; index: number };

type HudButtonState = 'idle' | 'pressed' | 'held' | 'unassigned';

type HudButtonFace = { from: 'image'; file: string } | { from: 'glyph'; pack: string; glyph: string };

interface HudButtonStates {
  idle: HudButtonFace;
  pressed?: HudButtonFace;
  held?: HudButtonFace;
  unassigned?: HudButtonFace;
}

interface HudButtonSpec {
  type: 'button';
  bind: HudButtonBind;
  states: HudButtonStates;
}

export type { HudButtonBind, HudButtonFace, HudButtonSpec, HudButtonState, HudButtonVerb };
