/* @layer renderer-hud @kind types */
/**
 * The prop surface of the one component that turns a solved layout into ink.
 *
 * Two halves, and keeping them apart is the whole design. `nodes` is GEOMETRY,
 * meaning whatever `layoutHud` handed back, already absolute, already
 * scaled, already dimmed. `content` is DATA, meaning what the save holds, what each
 * numbered slot fires, which artwork a glyph resolves to. Neither knows about
 * the other, which is why the live HUD, the pause menu's copy of the button map
 * and the editor's preview can all mount this component with the same geometry
 * and three different sets of values behind it.
 *
 * Nothing here reads a store, and nothing here computes a position.
 */
import type { HeartMode } from '../../primitives/HudHeart';
import type { HudCountdownVariant } from '../HudCountdown';
import type { PlacedNode } from '@shared/hud/engine';
import type { SlotIndex } from '@shared/types/controls/scheme';
import type { GlyphSource, HudElementSpec } from '@shared/types/hud';

/** The narrowed glyph element that `HudNodeContent.glyph` is asked about. */
type HudGlyphSpec = Extract<HudElementSpec, { type: 'glyph' }>;

/** What a numbered slot fires, which is what decides whether it wears a sprite. */
type HudSlotRole = 'item' | 'sword' | 'action' | 'none';

/** Everything the four vitals draw from, in the units the core reports them in. */
interface HudVitalsContent {
  healthCurrent: number;
  healthCapacity: number;
  heartMode: HeartMode;
  /** Armour tier, 0..2. Tints every heart. */
  armor: number;
  /** Raw magic power, 0..128. */
  magic: number;
  halfMagic: boolean;
  bombs: number;
  maxBombs: number;
  arrows: number;
  maxArrows: number;
  keys: number;
  hasSilverArrows: boolean;
  rupees: number;
  maxRupees: number;
  showMaxInYellow: boolean;
}

/** One numbered slot, resolved: what it fires and whether the save holds it. */
interface HudSlotContent {
  /** Sprite filename (no extension) for whatever the slot holds, or null. */
  itemSprite: string | null;
  role: HudSlotRole;
  /** Unassigned, or holding something the save does not own. Draw it flat. */
  dimmed: boolean;
}

/** The countdown as the caller tracks it (`hud-countdown-track.ts`), plus the
 *  pie the profile picked. A `countdown` node draws this, or nothing when absent. */
interface HudCountdownContent {
  /** The profile's `hudCountdownStyle`. A node's own `variant` wins over it. */
  variant: HudCountdownVariant;
  /** Seconds the countdown started from. */
  total: number;
  /** Whole seconds left. */
  remaining: number;
  /** Share of the countdown still to run, 1 down to 0. */
  fractionLeft: number;
}

interface HudNodeContent {
  vitals: HudVitalsContent;
  /** Keyed by slot NUMBER; a slot with no entry draws nothing. */
  slots: Readonly<Record<SlotIndex, HudSlotContent>>;
  /**
   * The artwork for one glyph element, already resolved through the pack chain.
   * A function instead of a table because a glyph names either a fixed
   * position or a slot, and only the caller knows the packs and the device.
   */
  glyph: (spec: HudGlyphSpec) => GlyphSource | null;
  /** Absent draws no countdown. The pause menu's copy of the map leaves it out. */
  countdown?: HudCountdownContent;
}

interface HudNodeRendererProps {
  /** Straight from the engine. Containers are skipped; their order is kept,
   *  because it is the paint order the document chose. */
  nodes: readonly PlacedNode[];
  /** Display pixels per SNES pixel. */
  scale: number;
  content: HudNodeContent;
  spritesBase: string;
  /**
   * The SNES-pixel point that maps to this renderer's own top-left corner.
   * Default `{ x: 0, y: 0 }` is the play field's corner, which is what the live
   * HUD wants. The pause menu passes the button map's own bounding origin so it
   * can pin that map into its right-hand column wherever the layout put it.
   */
  origin?: { x: number; y: number };
  /**
   * Make every node that names a slot clickable. The pause menu assigns this
   * way; the gameplay HUD leaves it out and the whole layer stays inert.
   */
  onSlotPress?: (slot: SlotIndex) => void;
  /**
   * The data scope a node's own `style` resolves its bound `Value`s against -
   * a border width, a shadow's blur, a tint's amount. Default `{}`, which
   * still resolves every literal number correctly; only an expression that
   * names a variable needs the real table.
   */
  dataScope?: Readonly<Record<string, number>>;
  /**
   * Park every `animation`'s shared clock at this instant, in ms, instead of
   * letting it run. The HUD layout editor's scrub/play head is the only caller
   * (`HudLayoutEditor/behavior/motion-preview.ts`); omitting it - which the
   * live HUD and the pause menu both do - leaves §27.7's free-running
   * `requestAnimationFrame` clock exactly as it was.
   */
  clockOverrideMs?: number | null;
}

export type {
  HudCountdownContent, HudGlyphSpec, HudNodeContent, HudNodeRendererProps, HudSlotContent, HudSlotRole,
  HudVitalsContent,
};
