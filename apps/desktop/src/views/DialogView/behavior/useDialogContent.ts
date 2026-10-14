/* @layer renderer-hud @kind hook */
import { useMemo } from 'react';
import { getSpritesBase, promptsFor } from '@rotp/game-data';
import type { DialogFrame } from '@rotp/game-data';
import { activeAlphabet, getGlyphAtlas } from '@rotp/game-core';
import type { DialogBoxSettings } from '../../../stores/dialog-settings-store';
import { useGameUIStore } from '../../../stores/game-ui-store';
import type { DialogContent } from '../DialogView.type';
import { pickerItemSprite } from './picker-item-sprite';
import { useButtonGlyphs } from './useButtonGlyphs';
import { useHighlightLook } from './useHighlightLook';

const useDialogContent = (frame: DialogFrame, look: DialogBoxSettings): DialogContent => {
  const inventory = useGameUIStore((s) => s.inventory);
  const equipment = useGameUIStore((s) => s.equipment);
  const { glyphsFor } = useButtonGlyphs();

  const atlas = useMemo(() => (frame.active ? getGlyphAtlas() : null), [frame.active, frame.messageId, frame.generation]);
  const alphabet = useMemo(() => (frame.active ? activeAlphabet() : []), [frame.active]);
  const highlight = useHighlightLook({ frame, primary: look.highlightPrimary, secondary: look.highlightSecondary });
  const prompts = look.buttonPrompts
    ? promptsFor(frame, look.prompts).map((p) => ({ glyphs: glyphsFor(p.buttons), label: p.label, hold: p.hold }))
    : [];
  const itemSprite = frame.wait === 'item' ? pickerItemSprite(frame.choice, inventory, equipment) : null;

  return { atlas, alphabet, highlight, spritesBase: getSpritesBase(), prompts, itemSprite };
};

export { useDialogContent };
