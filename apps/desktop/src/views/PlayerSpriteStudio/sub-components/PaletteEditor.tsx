/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Text } from '@drizztdourden08/tessera/primitives';
import { ColorPickerPopover } from '@drizztdourden08/tessera/color-picker-popover';
import { bgr555ToHex, isExactColor } from '@rotp/game-core';
import { StudioSection } from '@app/studio';
import type { PaletteEditorProps } from '../PlayerSpriteStudio.type';
import { outfitName } from '../behavior/outfit-name';
import { usePaletteSlot } from '../behavior/usePaletteSlot';
import { OutfitSwatchGrid } from './OutfitSwatchGrid';
import { GloveSwatchGrid } from './GloveSwatchGrid';

const PaletteEditor = (props: PaletteEditorProps) => {
  const t = useT();
  const { sheet, outfit, readOnly = false } = props;
  const palette = usePaletteSlot(props);
  const { slot, setSlot, anchorRef, live, colors, originals, openAt, wordOf, originalOf, change, reset, swatchGroups, title } = palette;

  return (
    <>
      <StudioSection title={t('views-player-sprite-studio:palette.outfit', { outfit: outfitName(outfit, t) })}>
        <OutfitSwatchGrid colors={colors} originals={originals} slot={slot} onOpen={openAt} />
        <Text variant="caption" tone="muted">{t('views-player-sprite-studio:palette.transparentNote')}</Text>
      </StudioSection>

      <StudioSection title={t('views-player-sprite-studio:palette.gloves')}>
        <GloveSwatchGrid gloves={live.gloves} originalGloves={sheet.original.gloves} slot={slot} onOpen={openAt} />
      </StudioSection>

      <ColorPickerPopover
        open={slot !== null && !readOnly}
        anchorRef={anchorRef}
        value={slot === null ? '#000000' : bgr555ToHex(wordOf(slot))}
        onChange={change}
        disableAlpha
        title={title}
        word={slot === null ? undefined : wordOf(slot)}
        original={slot === null ? undefined : bgr555ToHex(originalOf(slot))}
        snapped={slot !== null && !isExactColor(bgr555ToHex(wordOf(slot)))}
        onReset={reset}
        onClose={() => setSlot(null)}
        swatchGroups={swatchGroups}
      />
    </>
  );
};

export { PaletteEditor };
