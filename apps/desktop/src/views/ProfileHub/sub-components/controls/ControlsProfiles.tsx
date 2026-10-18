/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import { SidePanel } from '@drizztdourden08/tessera/composites';
import { useStoredFold } from './behavior/useStoredFold';
import { InputProfileList } from './InputProfileList';
import { SidebarProfileButton } from './SidebarProfileButton';
import { CONTROLS_PANEL_WIDTH, PROFILES_FOLD_KEY } from './controls.constants';
import type { CtrlProps } from './controls.type';

const ControlsProfiles = ({ ctrl }: CtrlProps) => {
  const { profiles, activeProfile, newlyCreatedId, selectProfile, setDeleteTarget, handleRename, handleCreate } = ctrl;
  const { collapsed, toggle, expand } = useStoredFold(PROFILES_FOLD_KEY, true);
  const activeId = activeProfile?.id ?? null;

  const handleAdd = useCallback(() => {
    expand();
    handleCreate();
  }, [expand, handleCreate]);

  const add = (
    <IconButton variant="ghost" size="sm" label="New profile" onClick={handleAdd}>
      <Icon name="plus" />
    </IconButton>
  );
  const rail = profiles.map((p) => (
    <SidebarProfileButton key={p.id} profile={p} active={p.id === activeId} onSelect={selectProfile} />
  ));

  return (
    <SidePanel
      title="Profiles"
      className="controls-panel--start"
      resizable={false}
      width={CONTROLS_PANEL_WIDTH}
      actions={add}
      rail={rail}
      collapsed={collapsed}
      onCollapsedChange={toggle}
    >
      <InputProfileList
        profiles={profiles}
        activeId={activeId}
        initialEditId={newlyCreatedId}
        onSelect={selectProfile}
        onDelete={setDeleteTarget}
        onRename={handleRename}
      />
    </SidePanel>
  );
};

export { ControlsProfiles };
