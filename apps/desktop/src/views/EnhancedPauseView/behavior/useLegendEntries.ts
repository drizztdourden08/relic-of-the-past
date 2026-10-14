/* @layer renderer-hud @kind hook */
import { useMemo } from 'react';
import { positionOfBinding, keyboardGlyphPath, resolveGlyph } from '@rotp/input-mapping';
import { declaredDeviceFamily } from '../../HudLayoutView/behavior/declared-family';
import { deviceFamilyOf } from '../../HudLayoutView/behavior/device-family';
import { useGlyphPacks } from '../../HudLayoutView/behavior/useGlyphPacks';
import { usePauseMenuStore } from '@app/stores/pause-menu-store';
import { ANY_BUTTON, CONFIRM_VERBS, LEGEND_VERBS, STICK_OF_AXIS } from '../EnhancedPauseView.constants';
import type { NavLegendEntry } from '../../../compounds/PauseNavLegend';
import type { PauseCursorActions } from '@app/stores/pause-menu-store';
import type { SdlPosition, GlyphPack, GlyphSource } from '@rotp/input-mapping';
import type { ModernBindings, DeviceFamily, InputBinding } from '@rotp/game-data';
import type { LegendRow } from '../EnhancedPauseView.type';

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

const rawTextFor = (binding: InputBinding): string => {
  if (binding.type === 'keyboard') return binding.label ?? binding.code.replace(/^(Key|Digit|Numpad)/, '');
  return binding.type === 'none' ? '' : (binding.label ?? '');
};

const textFor = (binding: InputBinding): string => rawTextFor(binding).toUpperCase().replace(/[^A-Z0-9 &]/g, '');

const dedupe = (glyphs: readonly GlyphSource[]): GlyphSource[] => {
  const seen = new Set<string>();
  return glyphs.filter((glyph) => {
    const key = glyph.kind === 'built-in' ? glyph.assetPath : glyph.fileKey;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const heldActions = (actions: PauseCursorActions, canConfirm: boolean): PauseCursorActions =>
  canConfirm ? actions : { ...actions, confirm: null };

const useLegendEntries = (
  bindings: ModernBindings | null,
  glyphPack: string,
  canConfirm: boolean,
): NavLegendEntry[] => {
  const packs = useGlyphPacks();
  const cursorActions = usePauseMenuStore((s) => s.cursorActions);

  return useMemo(() => {
    if (!bindings?.core) return [];
    const { core, slots } = bindings;
    const family = deviceFamilyOf(slots, declaredDeviceFamily());

    return rowsFor(heldActions(cursorActions, canConfirm)).map((row) => {
      const held = row.verbs.map((verb) => core[verb]);
      const glyphs = dedupe(held.map((b) => glyphFor(b, glyphPack, family, packs)).filter((g): g is GlyphSource => Boolean(g)));
      const fallback = row.text ?? held.map(textFor).find((text) => text.length > 0) ?? '';
      return { id: row.id, glyphs, fallback, verb: row.verb };
    }).filter((entry) => entry.glyphs.length > 0 || entry.fallback.length > 0);
  }, [bindings, glyphPack, canConfirm, cursorActions, packs]);
};

export { useLegendEntries };
