/* @layer renderer-components @kind component */
import { SpritePicker } from '@app/compounds/SpritePicker';
import { getSpritesBase, CATEGORY_LABELS, CATEGORY_ORDER, SPRITE_MANIFEST } from '@rotp/game-data';
import { ToolbarMenu } from './ToolbarMenu';
import { GlyphPickerGrid } from './GlyphPickerGrid';
import { SlotPickerPanel } from './SlotPickerPanel';
import { SpriteExtractionNotice } from './SpriteExtractionNotice';
import { TOOLBAR_ICONS } from '@app/hud-layout-editing/toolbar-menus';
import { newElement } from '@app/hud-layout-editing/new-node';
import type { InsertMenusProps } from './InsertMenus.type';

const spriteUrl = (file: string): string => `${getSpritesBase()}${file}.png`;

const InsertMenus = (props: InsertMenusProps) => {
  const { insert, slotNumbers, glyphPacks, openKey, onToggle, onClose } = props;

  return (
    <>
      <ToolbarMenu icon={TOOLBAR_ICONS.glyph} label="Glyph" open={openKey === 'glyph'} onToggle={() => onToggle('glyph')} onClose={onClose}
        panel={(anchorRef) => (
          <GlyphPickerGrid
            open
            anchorRef={anchorRef}
            packs={glyphPacks}
            onClose={onClose}
            onPick={(picked) => insert(newElement({ type: 'glyph', ...picked }))}
          />
        )} />
      <ToolbarMenu icon={TOOLBAR_ICONS.slot} label="Slot" open={openKey === 'slot'} onToggle={() => onToggle('slot')} onClose={onClose}
        panel={(anchorRef) => (
          <SlotPickerPanel
            open
            anchorRef={anchorRef}
            slotNumbers={slotNumbers}
            onClose={onClose}
            onPickItem={(index) => insert(newElement({ type: 'slot', index }))}
            onPickGlyph={(index) => insert(newElement({ type: 'glyph', slot: index }))}
          />
        )} />
      <ToolbarMenu icon={TOOLBAR_ICONS.sprite} label="Sprite" open={openKey === 'sprite'} onToggle={() => onToggle('sprite')} onClose={onClose}
        panel={(anchorRef) => (
          <SpritePicker
            open
            anchorRef={anchorRef}
            sprites={SPRITE_MANIFEST}
            categories={CATEGORY_ORDER}
            categoryLabels={CATEGORY_LABELS}
            spriteUrl={spriteUrl}
            onClose={onClose}
            onPick={(file) => insert(newElement({ type: 'sprite', file }))}
            notice={<SpriteExtractionNotice />}
          />
        )} />
    </>
  );
};

export { InsertMenus };
