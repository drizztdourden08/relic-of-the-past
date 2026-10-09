/* @layer renderer-components @kind hook */
import { useCallback, useMemo, useRef, useState } from 'react';
import { AUTO_PACK_ID } from '@shared/input/glyphs';
import { DEFAULT_LAYOUT, validateLayout } from '@shared/hud/layouts';
import { usePlacedLayout } from '@domains/hud/views/HudLayoutView';
import { useHudLayoutStore } from '@app/stores/hud-layout-store';
import { useGlyphPacks } from './useGlyphPacks';
import { useLayoutDraft } from './useLayoutDraft';
import { useNodeEdits } from './useNodeEdits';
import { useEditorSchemes } from './useEditorSchemes';
import { useSampleState } from './useSampleState';
import { nodeById } from './node-edits';
import { slotLookup } from './flex-slots';
import { solveLookup } from './grid-solve-lookup';
import { EDITOR_GROUNDS, EDITOR_RATIOS } from '../HudLayoutEditor.constants';
import type { GlyphPosition } from '@app/lib/hud/custom-glyph-store';
import type { HudLayout } from '@shared/types/hud';
import type { HudLayoutEditorProps } from '../HudLayoutEditor.type';

const useHudLayoutEditor = (props: HudLayoutEditorProps) => {
  const { layoutId, onCommitted } = props;

  const glyphs = useGlyphPacks();
  const schemes = useEditorSchemes();
  const liveLayoutId = useHudLayoutStore((s) => s.layoutId);
  const openId = useRef(layoutId ?? liveLayoutId);

  const committed = useCallback((saved: HudLayout) => {
    const scheme = schemes.selected?.id;
    if (scheme) void schemes.assignLayout(scheme, saved.id);
    onCommitted?.(saved);
  }, [onCommitted, schemes]);

  const draft = useLayoutDraft(openId.current, committed);
  const edits = useNodeEdits(draft.apply);

  const [ratioId, setRatioId] = useState(EDITOR_RATIOS[0].id);
  const [ground, setGround] = useState(EDITOR_GROUNDS[0]?.file ?? '');

  const layout = draft.draft ?? DEFAULT_LAYOUT;
  const packId = layout.glyphPack ?? AUTO_PACK_ID;
  const ratio = EDITOR_RATIOS.find((entry) => entry.id === ratioId) ?? EDITOR_RATIOS[0];
  const slots = schemes.selected?.slots ?? [];

  const sample = useSampleState({ packId, packs: glyphs.packs, slots, view: ratio.view });
  const ctx = useMemo(
    () => ({ hearts: sample.hearts, filledSlots: sample.filledSlots, scope: sample.dataScope }),
    [sample.dataScope, sample.filledSlots, sample.hearts],
  );
  const placed = usePlacedLayout(layout, sample.view, ctx);
  const gridSolve = useMemo(() => solveLookup(placed.all, ctx), [ctx, placed.all]);
  const flexSlots = useMemo(() => slotLookup(placed.all), [placed.all]);

  const positions = useMemo(
    () => sample.slots
      .map((slot) => slot.position)
      .filter((position): position is GlyphPosition => !!position),
    [sample.slots],
  );

  const createPack = useCallback(async () => {
    const pack = await glyphs.createPack(`My glyphs ${glyphs.custom.length + 1}`);
    if (pack) draft.setGlyphPack(pack.id);
  }, [draft, glyphs]);

  const deletePack = useCallback(async (id: string) => {
    await glyphs.deletePack(id);
    if (packId === id) draft.setGlyphPack(AUTO_PACK_ID);
  }, [draft, glyphs, packId]);

  const target = edits.targetId(draft.draft);
  const selected = draft.draft && edits.selectedId ? nodeById(draft.draft, edits.selectedId) : null;
  const validation = useMemo(() => validateLayout(layout), [layout]);

  return {
    glyphs, draft, edits, setRatioId, ground, setGround, layout, packId, ratio, slots,
    sample, placed, gridSolve, flexSlots, positions, createPack, deletePack, target, selected, validation,
  };
};

export { useHudLayoutEditor };
