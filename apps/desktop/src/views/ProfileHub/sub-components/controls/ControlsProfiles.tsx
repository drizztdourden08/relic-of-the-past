/* @layer renderer-components @kind component */
import { useCallback, useLayoutEffect } from 'react';
import { Box, Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import { SidePanel } from '@drizztdourden08/tessera/composites';
import { useStoredFold } from '../../../../hooks/useStoredFold';
import { InputProfileList } from './InputProfileList';
import { SidebarProfileButton } from './SidebarProfileButton';
import { PROFILES_FOLD_KEY, SIDE_PANEL_SIZE } from './controls.constants';
import { sideSlotClass } from './side-slot-class';
import type { ControlsSideProps } from './controls.type';

const ControlsProfiles = ({ ctrl, narrow }: ControlsSideProps) => {
  const { profiles, activeProfile, newlyCreatedId, selectProfile, setDeleteTarget, handleRename, handleCreate } = ctrl;
  const { collapsed, toggle, expand, collapse } = useStoredFold(PROFILES_FOLD_KEY, true);
  useLayoutEffect(() => {
    if (narrow) collapse();
  }, [narrow, collapse]);
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
    <Box className={sideSlotClass('start', collapsed)}>
      <SidePanel
        title="Profiles"
        {...SIDE_PANEL_SIZE}
        storageKey="controls:profiles-width"
        action={add}
        railItems={rail}
        collapsed={collapsed}
        onCollapsedChange={toggle}
        containers={[{
          title: 'Profile list',
          content: (
            <InputProfileList
              profiles={profiles}
              activeId={activeId}
              initialEditId={newlyCreatedId}
              onSelect={selectProfile}
              onDelete={setDeleteTarget}
              onRename={handleRename}
            />
          ),
        }]}
      />
    </Box>
  );
};

export { ControlsProfiles };
