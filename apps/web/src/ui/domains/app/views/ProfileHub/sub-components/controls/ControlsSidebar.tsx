/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box } from '../../../../../../design-system/primitives/Box';
import { Button } from '../../../../../../design-system/primitives/Button';
import { Text } from '../../../../../../design-system/primitives/Text';
import { InputProfileList } from './InputProfileList';
import { SidebarProfileButton } from './SidebarProfileButton';
import type { CtrlProps } from './controls.type';

const ControlsSidebar = ({ ctrl }: CtrlProps) => {
  const { setSidebarCollapsed, sidebarCollapsed, setDeleteTarget } = ctrl;
  const toggleCollapsed = useCallback(() => setSidebarCollapsed(!sidebarCollapsed), [setSidebarCollapsed, sidebarCollapsed]);

  return (
    <Box className={`controls-settings__sidebar ${ctrl.sidebarCollapsed ? 'controls-settings__sidebar--collapsed' : ''}`}>
      <Box className="controls-settings__col-header">
        <Button
          variant="bare"
          className="controls-settings__col-toggle"
          onClick={toggleCollapsed}
          title={ctrl.sidebarCollapsed ? 'Expand' : 'Collapse'}
        >
          {ctrl.sidebarCollapsed ? '▶' : '◀'}
        </Button>
        <Text className="controls-settings__col-title">Profiles</Text>
      </Box>
      <Box className="controls-settings__sidebar-icons">
        {ctrl.profiles.map((p) => (
          <SidebarProfileButton
            key={p.id}
            profile={p}
            active={p.id === ctrl.activeProfile?.id}
            onSelect={ctrl.selectProfile}
          />
        ))}
      </Box>
      <Box className="controls-settings__sidebar-content">
        <InputProfileList
          profiles={ctrl.profiles}
          activeId={ctrl.activeProfile?.id ?? null}
          initialEditId={ctrl.newlyCreatedId}
          onSelect={ctrl.selectProfile}
          onDelete={setDeleteTarget}
          onRename={ctrl.handleRename}
          onCreate={ctrl.handleCreate}
        />
      </Box>
    </Box>
  );
};

export { ControlsSidebar };
