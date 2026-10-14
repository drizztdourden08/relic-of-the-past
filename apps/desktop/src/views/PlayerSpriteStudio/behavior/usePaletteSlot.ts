/* @layer renderer-hooks @kind logic */
import { useState, useMemo, useCallback, useRef } from 'react';
import type { SwatchGroup } from '@drizztdourden08/tessera/color-picker';
import { OUTFIT_IDS } from '@rotp/game-data';
import { bgr555ToHex, hexToBgr555 } from '@rotp/game-core';
import { flattenPalette } from '@rotp/packs';
import { OUTFIT_LABELS } from '@rotp/design/packs';
import type { PaletteEditorProps, Slot } from '../PlayerSpriteStudio.type';
import { colorAt } from './color-at';
import { gloveSlot } from './glove-slot';
import { slotTitle } from './slot-title';

const usePaletteSlot = (params: PaletteEditorProps) => {
  const { sheet, outfit, readOnly = false, onColor, onGloveColor, onReset } = params;
  const [slot, setSlot] = useState<Slot>(null);
  const anchorRef = useRef<HTMLElement | null>(null);

  const live = useMemo(() => flattenPalette(sheet), [sheet]);
  const colors = live.outfits[outfit];
  const originals = sheet.original.outfits[outfit];

  const openAt = useCallback((el: HTMLElement, s: Exclude<Slot, null>) => {
    if (readOnly) return;
    anchorRef.current = el;
    setSlot((cur) => (cur === s ? null : s));
  }, [readOnly]);

  const wordOf = useCallback((s: Exclude<Slot, null>): number =>
    (typeof s === 'number' ? colorAt(colors, s) : live.gloves[gloveSlot(s)]), [colors, live.gloves]);

  const originalOf = useCallback((s: Exclude<Slot, null>): number =>
    (typeof s === 'number' ? colorAt(originals, s) : sheet.original.gloves[gloveSlot(s)]), [originals, sheet.original.gloves]);

  const change = useCallback((hex: string) => {
    if (slot === null) return;
    const word = hexToBgr555(hex);
    if (typeof slot === 'number') onColor(slot, word);
    else onGloveColor(gloveSlot(slot), word);
  }, [slot, onColor, onGloveColor]);

  const reset = useCallback(() => {
    if (slot === null) return;
    if (typeof slot === 'number') onReset(slot);
    else onGloveColor(gloveSlot(slot), sheet.original.gloves[gloveSlot(slot)]);
  }, [slot, onReset, onGloveColor, sheet.original.gloves]);

  const swatchGroups = useMemo<SwatchGroup[]>(() => {
    if (slot === null) return [];
    const currentHex = bgr555ToHex(wordOf(slot));
    const originalHex = bgr555ToHex(originalOf(slot));
    const thisColour = currentHex === originalHex ? [currentHex] : [currentHex, originalHex];
    return [
      { label: 'This colour', colors: thisColour },
      ...OUTFIT_IDS.map((id) => ({ label: `${OUTFIT_LABELS[id]} palette`, colors: live.outfits[id].map(bgr555ToHex) })),
      { label: 'Gloves', colors: live.gloves.map(bgr555ToHex) },
    ];
  }, [slot, live, wordOf, originalOf]);

  return { slot, setSlot, anchorRef, live, colors, originals, openAt, wordOf, originalOf, change, reset, swatchGroups, title: slotTitle(slot, outfit) };
};

export { usePaletteSlot };
