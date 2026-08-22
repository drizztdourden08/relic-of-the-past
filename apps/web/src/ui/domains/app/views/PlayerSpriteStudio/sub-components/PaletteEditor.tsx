/* @layer renderer-components @kind component */
import { useState, useMemo, useCallback } from 'react';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { ColorSwatch } from '@ds/primitives/ColorSwatch';
import { ColorPicker } from '@ds/composites/ColorPicker';
import { COLORS_PER_OUTFIT, GLOVES_INDEX } from '@shared/game/data/player-sheet/types';
import type { OutfitId, PlayerSheet } from '@shared/game/data/player-sheet/types';
import { bgr555ToHex, hexToBgr555, isExactColor } from '@app/lib/game/snes-color';
import { flattenPalette } from '@app/lib/game/player-sheet/flatten-palette';
import { OUTFIT_LABELS } from '../behavior/useWearing';

interface PaletteEditorProps {
  sheet: PlayerSheet;
  outfit: OutfitId;
  onColor: (index: number, word: number) => void;
  onGloveColor: (slot: 0 | 1, word: number) => void;
  onReset: (index: number) => void;
}

/** `null` = no slot open; a number = an outfit index; 'g0'/'g1' = a glove colour. */
type Slot = number | 'g0' | 'g1' | null;

const PaletteEditor = (props: PaletteEditorProps) => {
  const { sheet, outfit, onColor, onGloveColor, onReset } = props;
  const [slot, setSlot] = useState<Slot>(null);

  const live = useMemo(() => flattenPalette(sheet), [sheet]);
  const colors = live.outfits[outfit];
  const originals = sheet.original.outfits[outfit];

  const wordOf = useCallback((s: Exclude<Slot, null>): number =>
    (typeof s === 'number' ? colors[s] : live.gloves[s === 'g0' ? 0 : 1]), [colors, live.gloves]);

  const originalOf = useCallback((s: Exclude<Slot, null>): number =>
    (typeof s === 'number' ? originals[s] : sheet.original.gloves[s === 'g0' ? 0 : 1]), [originals, sheet.original.gloves]);

  const change = useCallback((hex: string) => {
    if (slot === null) return;
    const word = hexToBgr555(hex);
    if (typeof slot === 'number') onColor(slot, word);
    else onGloveColor(slot === 'g0' ? 0 : 1, word);
  }, [slot, onColor, onGloveColor]);

  const reset = useCallback(() => {
    if (slot === null) return;
    if (typeof slot === 'number') onReset(slot);
    else onGloveColor(slot === 'g0' ? 0 : 1, sheet.original.gloves[slot === 'g0' ? 0 : 1]);
  }, [slot, onReset, onGloveColor, sheet.original.gloves]);

  const title = slot === null
    ? ''
    : typeof slot === 'number'
      ? `${OUTFIT_LABELS[outfit]} · index ${slot + 1}`
      : `Gloves · ${slot === 'g0' ? 'power' : 'titan'}`;

  return (
    <Box className="palette-editor">
      <Text className="palette-editor__title">
        {OUTFIT_LABELS[outfit]} palette
        <Text as="span" className="palette-editor__hint">index 0 is transparent and has no entry</Text>
      </Text>
      <Box className="palette-editor__grid">
        {Array.from({ length: COLORS_PER_OUTFIT }, (_, i) => (
          <ColorSwatch
            key={i}
            color={bgr555ToHex(colors[i])}
            caption={i + 1}
            selected={slot === i}
            edited={colors[i] !== originals[i]}
            title={`Index ${i + 1}${i + 1 === GLOVES_INDEX ? ' — replaced by the glove colour when gloves are worn' : ''}`}
            onClick={() => setSlot(slot === i ? null : i)}
          />
        ))}
      </Box>

      <Text className="palette-editor__title">Glove colours</Text>
      <Box className="palette-editor__grid">
        {([0, 1] as const).map((g) => (
          <ColorSwatch
            key={g}
            color={bgr555ToHex(live.gloves[g])}
            caption={g === 0 ? 'P' : 'T'}
            selected={slot === (g === 0 ? 'g0' : 'g1')}
            edited={live.gloves[g] !== sheet.original.gloves[g]}
            title={g === 0 ? 'Power gloves' : 'Titan mitts'}
            onClick={() => setSlot(slot === (g === 0 ? 'g0' : 'g1') ? null : (g === 0 ? 'g0' : 'g1'))}
          />
        ))}
      </Box>

      {slot !== null && (
        <ColorPicker
          value={bgr555ToHex(wordOf(slot))}
          onChange={change}
          title={title}
          word={wordOf(slot)}
          original={bgr555ToHex(originalOf(slot))}
          snapped={!isExactColor(bgr555ToHex(wordOf(slot)))}
          onReset={reset}
          onClose={() => setSlot(null)}
        />
      )}
    </Box>
  );
};

export { PaletteEditor };
export type { PaletteEditorProps };
