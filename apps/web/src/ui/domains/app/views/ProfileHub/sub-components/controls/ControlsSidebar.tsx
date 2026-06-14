/* @layer renderer-components @kind component */
/** ControlsSettings left column: input-profile list (collapsible). */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Button } from '../../../../../../design-system/primitives/Button';
import { Text } from '../../../../../../design-system/primitives/Text';
import { InputProfileList } from './InputProfileList';
import type { useControlsSettings } from '../useControlsSettings';

type Ctrl = ReturnType<typeof useControlsSettings>;

const ControlsSidebar = ({ ctrl }: { ctrl: Ctrl }) => {
  return (
    <Box className={`controls-settings__sidebar ${ctrl.sidebarCollapsed ? 'controls-settings__sidebar--collapsed' : ''}`}>
      <Box className="controls-settings__col-header">
        <Button
          variant="bare"
          className="controls-settings__col-toggle"
          onClick={() => ctrl.setSidebarCollapsed(!ctrl.sidebarCollapsed)}
          title={ctrl.sidebarCollapsed ? 'Expand' : 'Collapse'}
        >
          {ctrl.sidebarCollapsed ? '▶' : '◀'}
        </Button>
        <Text className="controls-settings__col-title">Profiles</Text>
      </Box>
      {/* Collapsed: show icon strip for quick profile selection */}
      <Box className="controls-settings__sidebar-icons">
        {ctrl.profiles.map((p) => (
          <Button
            variant="bare"
            key={p.id}
            className={`controls-settings__sidebar-icon-btn ${p.id === ctrl.activeProfile?.id ? 'controls-settings__sidebar-icon-btn--active' : ''}`}
            onClick={() => ctrl.selectProfile(p)}
            title={p.name}
          >
            {p.deviceType === 'keyboard' ? '⌨️' : '🎮'}
          </Button>
        ))}
      </Box>
      {/* Expanded: full profile list */}
      <Box className="controls-settings__sidebar-content">
        <InputProfileList
          profiles={ctrl.profiles}
          activeId={ctrl.activeProfile?.id ?? null}
          initialEditId={ctrl.newlyCreatedId}
          onSelect={ctrl.selectProfile}
          onDelete={(p) => ctrl.setDeleteTarget(p)}
          onRename={ctrl.handleRename}
          onCreate={ctrl.handleCreate}
        />
      </Box>
    </Box>
  );
};

export { ControlsSidebar };
