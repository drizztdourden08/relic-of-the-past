/* @layer renderer-components @kind component */
import { Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import { SidePanel } from '@drizztdourden08/tessera/composites';
import { InputProfileList } from './InputProfileList';
import { SidebarProfileButton } from './SidebarProfileButton';
import type { CtrlProps } from './controls.type';

const ControlsProfiles = ({ ctrl }: CtrlProps) => {
  const { profiles, activeProfile, newlyCreatedId, selectProfile, setDeleteTarget, handleRename, handleCreate } = ctrl;
  const activeId = activeProfile?.id ?? null;
  const actions = (
    <IconButton variant="ghost" size="sm" label="New profile" onClick={handleCreate}>
      <Icon name="plus" />
    </IconButton>
  );
  const rail = profiles.map((p) => (
    <SidebarProfileButton key={p.id} profile={p} active={p.id === activeId} onSelect={selectProfile} />
  ));

  return (
    <SidePanel title="Profiles" storageKey="controls.profiles" defaultCollapsed actions={actions} rail={rail}>
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
