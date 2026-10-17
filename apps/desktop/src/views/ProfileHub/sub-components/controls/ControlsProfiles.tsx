/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import { ListPanel, useStoredFold } from '../../../../compounds/ListPanel';
import { InputProfileList } from './InputProfileList';
import { SidebarProfileButton } from './SidebarProfileButton';
import { PROFILES_FOLD_KEY } from './controls.constants';
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
    <ListPanel title="Profiles" action={add} rail={rail} collapsed={collapsed} onToggle={toggle}>
      <InputProfileList
        profiles={profiles}
        activeId={activeId}
        initialEditId={newlyCreatedId}
        onSelect={selectProfile}
        onDelete={setDeleteTarget}
        onRename={handleRename}
      />
    </ListPanel>
  );
};

export { ControlsProfiles };
