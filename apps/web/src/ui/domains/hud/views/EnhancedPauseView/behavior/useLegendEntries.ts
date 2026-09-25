/* @layer renderer-hud @kind hook */
/**
 * The bottom strip, built from the bindings the player actually has.
 *
 * Not one letter here is hardcoded. Every one of the ten menu-relevant verbs is
 * rebindable (the whole premise of the modern scheme), so a legend
 * that said "A: confirm" would be wrong the moment anyone moved confirm, and
 * wrong by default on half the pads on the market. Each verb is resolved
 * binding to physical position to glyph, through the same pack chain the
 * cluster's chips use, so the strip and the chips can never disagree.
 *
 * A stick claims no SDL button position, which is exactly why binding movement
 * to it frees the d-pad for slots. That makes it the one case this file has to
 * name for itself: for the LEGEND the stick is a control the player can see, so
 * an axis is mapped to a position of its own even though the slot layer treats
 * it as claiming nothing. That position is the AXIS ('LEFT_X', 'LEFT_Y'),
 * which every pack answers with the neutral stick art, and never the stick
 * CLICK ('LEFT_STICK'), whose glyph is the stick being pressed in. The two
 * pictures are a nudge apart and mean opposite things: the click glyph on the
 * MOVE row tells the player to press the stick down to walk, and it
 * is pixel-identical to the L3 chip a few rows above it.
 *
 * THE STRIP SAYS WHAT THIS CURSOR CAN DO, not what the menu can do in general.
 * It used to be six fixed pairs, and two of them were wrong wherever they were
 * drawn: MAP named a button that raises no menu event at all, and BACK named
 * CLOSE's action in a different word on every screen's first section. The four
 * that were right were still silent about the thing a player in an inventory
 * most needs told. A button press is what puts something on a button.
 *
 * So every row is asked of the cursor. `pause-menu-store` answers, from the
 * same rules the presses themselves are planned through (`confirmVerbAt`,
 * `assignTargetAt`, `firstSectionOf`), which is what stops the bar promising
 * something the reducer will not do. CONFIRM in particular is not one verb: it
 * EQUIPS a tier, REMOVES the one already worn, ACTIVATES a status row, and on
 * the item grid means nothing. Four answers, where the strip once printed one
 * word and a boolean chose whether to print it.
 *
 * The ASSIGN row names no button on purpose. Any button the menu has not
 * claimed will do, so naming one would be a lie in the other direction.
 */
import { useMemo } from 'react';
import { SDL_AXIS } from '@shared/input/sdl-buttons';
import { positionOfBinding } from '@shared/input/scheme';
import { keyboardGlyphPath, resolveGlyph } from '@shared/input/glyphs';
import { declaredDeviceFamily } from '../../HudLayoutView/behavior/declared-family';
import { deviceFamilyOf } from '../../HudLayoutView/behavior/device-family';
import { useGlyphPacks } from '../../HudLayoutView/behavior/useGlyphPacks';
import { usePauseMenuStore } from '@app/stores/pause-menu-store';
import { ANY_BUTTON, CONFIRM_VERBS, LEGEND_VERBS } from '../EnhancedPauseView.constants';
import type { NavLegendEntry } from '../../../compounds/PauseNavLegend';
import type { PauseCursorActions } from '@app/stores/pause-menu-store';
import type { SdlPosition } from '@shared/input/scheme';
import type { CoreBindings, ModernBindings } from '@shared/types/controls/scheme';
import type { DeviceFamily, InputBinding } from '@shared/types/controls';
import type { GlyphPack, GlyphSource } from '@shared/types/hud';

/** A stick axis under its own name (the legend's own question, see the header).
 *  Both axes of one stick share a pack entry, so up/down and left/right resolve
 *  to the same picture and `dedupe` collapses them to one glyph. */
const STICK_OF_AXIS: Record<number, SdlPosition> = {
  [SDL_AXIS.LEFT_X]: 'LEFT_X', [SDL_AXIS.LEFT_Y]: 'LEFT_Y',
  [SDL_AXIS.RIGHT_X]: 'RIGHT_X', [SDL_AXIS.RIGHT_Y]: 'RIGHT_Y',
};

/** Verb, then the bindings whose glyphs stand for it. */
interface LegendRow {
  id: string;
  verb: string;
  /** Core verbs whose glyphs stand for this row. Empty for a row with no button. */
  verbs: readonly (keyof CoreBindings)[];
  /** Drawn in a glyph's place. The assign row's whole left half. */
  text?: string;
}

/**
 * The rows this cursor earns, in reading order: how to get around, then what
 * can be done here, then the ways out. Navigation and CLOSE are the only two
 * that are true everywhere.
 */
const rowsFor = (actions: PauseCursorActions): LegendRow[] => [
  { id: 'screen', verb: LEGEND_VERBS.screen, verbs: ['prevScreen', 'nextScreen'] },
  { id: 'move', verb: LEGEND_VERBS.move, verbs: ['up', 'down', 'left', 'right'] },
  ...(actions.confirm ? [{ id: 'confirm', verb: CONFIRM_VERBS[actions.confirm], verbs: ['confirm' as const] }] : []),
  ...(actions.assign ? [{ id: 'assign', verb: LEGEND_VERBS.assign, verbs: [], text: ANY_BUTTON }] : []),
  ...(actions.back ? [{ id: 'cancel', verb: LEGEND_VERBS.cancel, verbs: ['cancel' as const] }] : []),
  { id: 'close', verb: LEGEND_VERBS.close, verbs: ['pause'] },
];

const positionFor = (binding: InputBinding): SdlPosition | null => {
  const claimed = positionOfBinding(binding);
  if (claimed) return claimed;
  return binding.type === 'gamepad-axis' ? (STICK_OF_AXIS[binding.axisIndex] ?? null) : null;
};

const glyphFor = (
  binding: InputBinding,
  pack: string,
  family: DeviceFamily,
  packs: readonly GlyphPack[],
): GlyphSource | null => {
  if (binding.type === 'keyboard') {
    const path = keyboardGlyphPath(binding.code);
    return path ? { kind: 'built-in', assetPath: path } : null;
  }
  const position = positionFor(binding);
  return position ? resolveGlyph(pack, position, family, packs) : null;
};

/** Text for a control no pack draws. Folded to the letters the font can draw. */
const textFor = (binding: InputBinding): string => {
  const raw = binding.type === 'keyboard'
    ? (binding.label ?? binding.code.replace(/^(Key|Digit|Numpad)/, ''))
    : (binding.type === 'none' ? '' : (binding.label ?? ''));
  return raw.toUpperCase().replace(/[^A-Z0-9 &]/g, '');
};

/** Two glyphs for one verb collapse to one when the same control does both. */
const dedupe = (glyphs: readonly GlyphSource[]): GlyphSource[] => {
  const seen = new Set<string>();
  return glyphs.filter((glyph) => {
    const key = glyph.kind === 'built-in' ? glyph.assetPath : glyph.fileKey;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * What the cursor can do, and the view's own answer about the confirm row.
 *
 * `canConfirm` arrives through `useVisibleBrowsing`, which holds the last
 * browsed position across the exit slide so the menu leaves looking like the
 * menu the player was in; `cursorActions` is the same question answered in
 * full. They are two readings of one rule and they agree, so where they ever
 * did not, the row is dropped: a strip one verb short for one frame costs
 * nothing, a strip promising a press that does nothing costs a player the try.
 */
const heldActions = (actions: PauseCursorActions, canConfirm: boolean): PauseCursorActions =>
  canConfirm ? actions : { ...actions, confirm: null };

const useLegendEntries = (
  bindings: ModernBindings | null,
  glyphPack: string,
  canConfirm: boolean,
): NavLegendEntry[] => {
  // The player's own packs and the shipped ones (contract section 12,
  // gap 3). Without them the strip resolves a custom pack against a list it is
  // not in and silently falls through to the device family, which is exactly
  // the disagreement with the cluster's chips this file exists to prevent.
  const packs = useGlyphPacks();
  const cursorActions = usePauseMenuStore((s) => s.cursorActions);

  return useMemo(() => {
    const core = bindings?.core;
    if (!core) return [];
    const family = deviceFamilyOf(bindings?.slots ?? [], declaredDeviceFamily());

    return rowsFor(heldActions(cursorActions, canConfirm)).map((row) => {
      const held = row.verbs.map((verb) => core[verb]);
      const glyphs = dedupe(held.map((b) => glyphFor(b, glyphPack, family, packs)).filter((g): g is GlyphSource => !!g));
      const fallback = row.text ?? held.map(textFor).find((text) => text.length > 0) ?? '';
      return { id: row.id, glyphs, fallback, verb: row.verb };
    }).filter((entry) => entry.glyphs.length > 0 || entry.fallback.length > 0);
  }, [bindings, glyphPack, canConfirm, cursorActions, packs]);
};

export { useLegendEntries };
