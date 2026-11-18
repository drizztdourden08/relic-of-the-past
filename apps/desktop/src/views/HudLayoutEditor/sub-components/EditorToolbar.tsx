/* @layer renderer-components @kind component */
import { Box, Icon, IconButton, Text } from '@drizztdourden08/tessera/primitives';
import { ToolbarMenu } from './ToolbarMenu';
import { GroundPicker } from './GroundPicker';
import { InsertMenus } from './InsertMenus';
import { RatioPicker } from './RatioPicker';
import { TOOLBAR_ICONS, buildToolbarGroups, presetItems, subtreePresetItems, useToolbarMenu } from '@app/hud-layout-editing/toolbar-menus';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import type { EditorToolbarProps } from './EditorToolbar.type';
import { useT } from '@drizztdourden08/brock-react';

const EditorToolbar = (props: EditorToolbarProps) => {
  const t = useT();
  const {
    insert, layouts, draftId, onStartFrom, slotNumbers, glyphPacks,
    ratio, onRatioChange, ground, onGroundChange, targetLabel,
  } = props;
  const { bar, openKey, close, toggle } = useToolbarMenu();
  const snapping = useHudEditorViewStore((s) => s.snappingEnabled);
  const toggleSnapping = useHudEditorViewStore((s) => s.toggleSnapping);
  const groups = buildToolbarGroups({ insert, t });
  const groupItems = (key: string) => groups.find((group) => group.key === key)?.items ?? [];

  return (
    <Box ref={bar} className="hud-toolbar" role="toolbar" aria-label={t('hud-editor:editor-toolbar.aria.insert')}>
      <ToolbarMenu icon={TOOLBAR_ICONS.container} label={t('hud-editor:editor-toolbar.label.container')} items={groupItems('container')}
        open={openKey === 'container'} onToggle={() => toggle('container')} onClose={close} />

      <Box className="hud-toolbar__sep" />

      <InsertMenus
        insert={insert}
        slotNumbers={slotNumbers}
        glyphPacks={glyphPacks}
        openKey={openKey}
        onToggle={toggle}
        onClose={close}
      />
      <ToolbarMenu icon={TOOLBAR_ICONS.spacer} label={t('hud-editor:editor-toolbar.label.spacer')} items={groupItems('spacer')}
        open={openKey === 'spacer'} onToggle={() => toggle('spacer')} onClose={close} />

      <Box className="hud-toolbar__sep" />

      <ToolbarMenu icon={TOOLBAR_ICONS.dynamics} label={t('hud-editor:editor-toolbar.label.dynamics')} items={groupItems('dynamics')}
        open={openKey === 'dynamics'} onToggle={() => toggle('dynamics')} onClose={close} />

      <Box className="hud-toolbar__sep" />

      <ToolbarMenu
        icon={TOOLBAR_ICONS.preset} label={t('hud-editor:editor-toolbar.label.preset')}
        items={[...subtreePresetItems({ insert, t }), { separator: true }, ...presetItems(layouts, draftId, onStartFrom)]}
        open={openKey === 'preset'} onToggle={() => toggle('preset')} onClose={close}
      />

      <Box className="hud-toolbar__sep" />

      <IconButton
        variant="ghost"
        active={snapping}
        label={t('hud-editor:editor-toolbar.label.snapping')}
        title={t('hud-editor:editor-toolbar.title.snap-resize-to-the-8px')}
        onClick={toggleSnapping}
      >
        <Icon icon={TOOLBAR_ICONS.snapping} size={16} aria-hidden />
      </IconButton>

      <Text className="hud-toolbar__target" title={t('hud-editor:editor-toolbar.title.where-the-next-insert-lands')}>
        into {targetLabel}
      </Text>

      <Box className="hud-toolbar__spacer" />

      <RatioPicker value={ratio.id} onChange={onRatioChange} />
      <GroundPicker value={ground?.file ?? ''} onChange={onGroundChange} />
    </Box>
  );
};

export { EditorToolbar };
