/* @layer renderer-components @kind component */
/**
 * The bar across the top: everything that can be added, and everything the
 * preview is judged against.
 *
 * ICON-ONLY, grouped by what a button makes (containers, leaves, presets,
 * view toggles), with a separator between groups instead of a label on
 * each button; the tooltip carries the name. Sprite and Glyph do not open a
 * list: they open a picker grid, because a sprite or a glyph is something you
 * recognise by its picture, never by its filename.
 *
 * WHAT THE PREVIEW IS JUDGED AGAINST lives on the right: the display ratio and
 * the ground. Both are session-only and never written to the document,
 * which is why they are not mixed in with the inserts. The glyph pack IS
 * written to the document (`layout.glyphPack`) and is edited in one place
 * only: the inspector rail's `GlyphPackPicker`, which also owns custom-pack
 * import/management. This toolbar does not duplicate that control.
 *
 * ONE MENU OPEN AT A TIME, closed by choosing, by Escape, or by pressing
 * anywhere that is not a menu.
 *
 * THE GRID-VIEW TOGGLE IS NOT HERE ANY MORE (§55). "show grid overlay should be
 * in the same section (first)", so it MOVED to `LayoutSettings`, beside the
 * guide colour whose lines it draws; it is not mirrored here, because two
 * controls for one boolean is the `guide.show` mistake that pass also deleted.
 * `snapping` stays: it is about the STAGE's drag, which is this bar's own
 * business, and there is no section in the rail that it belongs to.
 *
 * THE ICONS ARE LUCIDE (§50), through `@iconify/react`, from one table in
 * `behavior/toolbar-menus.ts`. They were Unicode characters, which is a font
 * the OS chose instead of a picture this project drew, and the grid editor's
 * new toolbar is built from the same pieces so the two read as one kind of
 * thing.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDismissable } from '@ds/primitives/Portal';
import { Box } from '@ds/primitives/Box';
import { IconButton } from '@ds/primitives/IconButton';
import { Text } from '@ds/primitives/Text';
import { SpritePicker } from '@ds/composites/SpritePicker';
import { getSpritesBase } from '@shared/game/logic/queries/item-sprites';
import { CATEGORY_LABELS, CATEGORY_ORDER, SPRITE_MANIFEST } from '@shared/game/data/sprite-manifest/manifest';
import { ToolbarMenu } from './ToolbarMenu';
import { GlyphPickerGrid } from './GlyphPickerGrid';
import { GroundPicker } from './GroundPicker';
import { RatioPicker } from './RatioPicker';
import { SlotPickerPanel } from './SlotPickerPanel';
import { SpriteExtractionNotice } from './SpriteExtractionNotice';
import { TOOLBAR_ICONS, buildToolbarGroups, presetItems, subtreePresetItems } from '../behavior/toolbar-menus';
import { newElement } from '../behavior/new-node';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import type { EditorGround, EditorRatio } from '../HudLayoutEditor.constants';
import type { GlyphPack, HudLayout, HudNode } from '@shared/types/hud';

const spriteUrl = (file: string): string => `${getSpritesBase()}${file}.png`;

interface EditorToolbarProps {
  insert: (node: HudNode) => void;
  layouts: readonly HudLayout[];
  draftId: string;
  onStartFrom: (layout: HudLayout) => void;
  /** Slot numbers the previewed scheme currently has. A shortcut in the Slot
   *  panel, never a cap on what can be typed there. */
  slotNumbers: readonly number[];
  glyphPacks: readonly GlyphPack[];
  ratio: EditorRatio;
  onRatioChange: (id: string) => void;
  ground: EditorGround | null;
  onGroundChange: (file: string) => void;
  /** The container the selection points at, where the next insert will land. */
  targetLabel: string;
}

const EditorToolbar = (props: EditorToolbarProps) => {
  const {
    insert, layouts, draftId, onStartFrom, slotNumbers, glyphPacks,
    ratio, onRatioChange, ground, onGroundChange, targetLabel,
  } = props;
  const [openKey, setOpenKey] = useState<string | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const snapping = useHudEditorViewStore((s) => s.snappingEnabled);
  const toggleSnapping = useHudEditorViewStore((s) => s.toggleSnapping);

  // A press anywhere that is neither the bar nor an open panel closes it. The
  // panel may be portalled, so "inside" has to be asked of it too.
  useEffect(() => {
    if (!openKey) return;
    const dismiss = (event: Event): void => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('.dropdown-menu, .hud-picker-grid') || (bar.current && target && bar.current.contains(target))) return;
      setOpenKey(null);
    };
    document.addEventListener('pointerdown', dismiss, true);
    return () => document.removeEventListener('pointerdown', dismiss, true);
  }, [openKey]);

  const close = useCallback(() => setOpenKey(null), []);

  // The bar owns "one open at a time", so it is the bar and not each menu that
  // registers at the `menu` level. A picker panel it opens registers itself at
  // `popover` and therefore wins, which is why Escape over the sprite grid
  // closes the grid, not the whole editor behind it.
  useDismissable({ active: openKey !== null, level: 'menu', onDismiss: close });
  const toggle = useCallback((key: string) => setOpenKey((current) => (current === key ? null : key)), []);
  const groups = buildToolbarGroups({ insert });
  const groupItems = (key: string) => groups.find((group) => group.key === key)?.items ?? [];

  return (
    <Box ref={bar} className="hud-toolbar" role="toolbar" aria-label="Insert">
      <ToolbarMenu icon={TOOLBAR_ICONS.container} label="Container" items={groupItems('container')}
        open={openKey === 'container'} onToggle={() => toggle('container')} onClose={close} />

      <Box className="hud-toolbar__sep" />

      <ToolbarMenu icon={TOOLBAR_ICONS.glyph} label="Glyph" open={openKey === 'glyph'} onToggle={() => toggle('glyph')} onClose={close}
        panel={(anchorRef) => (
          <GlyphPickerGrid
            open
            anchorRef={anchorRef}
            packs={glyphPacks}
            onClose={close}
            onPick={(picked) => insert(newElement({ type: 'glyph', ...picked }))}
          />
        )} />
      <ToolbarMenu icon={TOOLBAR_ICONS.slot} label="Slot" open={openKey === 'slot'} onToggle={() => toggle('slot')} onClose={close}
        panel={(anchorRef) => (
          <SlotPickerPanel
            open
            anchorRef={anchorRef}
            slotNumbers={slotNumbers}
            onClose={close}
            onPickItem={(index) => insert(newElement({ type: 'slot', index }))}
            onPickGlyph={(index) => insert(newElement({ type: 'glyph', slot: index }))}
          />
        )} />
      <ToolbarMenu icon={TOOLBAR_ICONS.sprite} label="Sprite" open={openKey === 'sprite'} onToggle={() => toggle('sprite')} onClose={close}
        panel={(anchorRef) => (
          <SpritePicker
            open
            anchorRef={anchorRef}
            sprites={SPRITE_MANIFEST}
            categories={CATEGORY_ORDER}
            categoryLabels={CATEGORY_LABELS}
            spriteUrl={spriteUrl}
            onClose={close}
            onPick={(file) => insert(newElement({ type: 'sprite', file }))}
            notice={<SpriteExtractionNotice />}
          />
        )} />
      <ToolbarMenu icon={TOOLBAR_ICONS.spacer} label="Spacer" items={groupItems('spacer')}
        open={openKey === 'spacer'} onToggle={() => toggle('spacer')} onClose={close} />

      <Box className="hud-toolbar__sep" />

      <ToolbarMenu icon={TOOLBAR_ICONS.dynamics} label="Dynamics" items={groupItems('dynamics')}
        open={openKey === 'dynamics'} onToggle={() => toggle('dynamics')} onClose={close} />

      <Box className="hud-toolbar__sep" />

      <ToolbarMenu
        icon={TOOLBAR_ICONS.preset} label="Preset"
        items={[...subtreePresetItems({ insert }), 'separator', ...presetItems(layouts, draftId, onStartFrom)]}
        open={openKey === 'preset'} onToggle={() => toggle('preset')} onClose={close}
      />

      <Box className="hud-toolbar__sep" />

      <IconButton
        variant="ghost"
        active={snapping}
        label="Snapping"
        title="Snap resize to the 8px game grid and to sibling edges, with an alignment guide"
        onClick={toggleSnapping}
      >
        <IconifyIcon icon={TOOLBAR_ICONS.snapping} width={16} height={16} aria-hidden />
      </IconButton>

      <Text className="hud-toolbar__target" title="Where the next insert lands">
        into {targetLabel}
      </Text>

      <Box className="hud-toolbar__spacer" />

      <RatioPicker value={ratio.id} onChange={onRatioChange} />
      <GroundPicker value={ground?.file ?? ''} onChange={onGroundChange} />
    </Box>
  );
};

export { EditorToolbar };
export type { EditorToolbarProps };
