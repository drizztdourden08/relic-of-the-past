/* @layer renderer-components @kind component */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDismissable, Box, IconButton, Text } from '@drizztdourden08/tessera/primitives';
import { SpritePicker } from '@drizztdourden08/tessera/composites';
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
import type { EditorToolbarProps } from './EditorToolbar.type';

const spriteUrl = (file: string): string => `${getSpritesBase()}${file}.png`;

const EditorToolbar = (props: EditorToolbarProps) => {
  const {
    insert, layouts, draftId, onStartFrom, slotNumbers, glyphPacks,
    ratio, onRatioChange, ground, onGroundChange, targetLabel,
  } = props;
  const [openKey, setOpenKey] = useState<string | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const snapping = useHudEditorViewStore((s) => s.snappingEnabled);
  const toggleSnapping = useHudEditorViewStore((s) => s.toggleSnapping);

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
export type { EditorToolbarProps } from './EditorToolbar.type';
