/* @layer renderer-components @kind component */
import { Box, Icon, IconButton, Text } from '@drizztdourden08/tessera/primitives';
import { ToolbarMenu } from './ToolbarMenu';
import { GroundPicker } from './GroundPicker';
import { InsertMenus } from './InsertMenus';
import { RatioPicker } from './RatioPicker';
import { TOOLBAR_ICONS, buildToolbarGroups, presetItems, subtreePresetItems, useToolbarMenu } from '@app/hud-layout-editing/toolbar-menus';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import type { EditorToolbarProps } from './EditorToolbar.type';

const EditorToolbar = (props: EditorToolbarProps) => {
  const {
    insert, layouts, draftId, onStartFrom, slotNumbers, glyphPacks,
    ratio, onRatioChange, ground, onGroundChange, targetLabel,
  } = props;
  const { bar, openKey, close, toggle } = useToolbarMenu();
  const snapping = useHudEditorViewStore((s) => s.snappingEnabled);
  const toggleSnapping = useHudEditorViewStore((s) => s.toggleSnapping);
  const groups = buildToolbarGroups({ insert });
  const groupItems = (key: string) => groups.find((group) => group.key === key)?.items ?? [];

  return (
    <Box ref={bar} className="hud-toolbar" role="toolbar" aria-label="Insert">
      <ToolbarMenu icon={TOOLBAR_ICONS.container} label="Container" items={groupItems('container')}
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
      <ToolbarMenu icon={TOOLBAR_ICONS.spacer} label="Spacer" items={groupItems('spacer')}
        open={openKey === 'spacer'} onToggle={() => toggle('spacer')} onClose={close} />

      <Box className="hud-toolbar__sep" />

      <ToolbarMenu icon={TOOLBAR_ICONS.dynamics} label="Dynamics" items={groupItems('dynamics')}
        open={openKey === 'dynamics'} onToggle={() => toggle('dynamics')} onClose={close} />

      <Box className="hud-toolbar__sep" />

      <ToolbarMenu
        icon={TOOLBAR_ICONS.preset} label="Preset"
        items={[...subtreePresetItems({ insert }), { separator: true }, ...presetItems(layouts, draftId, onStartFrom)]}
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
        <Icon icon={TOOLBAR_ICONS.snapping} size={16} aria-hidden />
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
