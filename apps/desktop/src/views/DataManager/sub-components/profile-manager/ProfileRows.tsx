/* @layer renderer-components @kind component */
import { Status, IconButton, EmptyState, Stack, Icon } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { formatRelativeTime } from '@drizztdourden08/brock-core';
import type { ProfileRowsProps } from './profile-manager.type';

const ProfileRows = (props: ProfileRowsProps) => {
  const { profiles, selected, onSelect, onOpen, onDelete } = props;

  return (
    <Stack gap="xs">
      {profiles.length === 0 && <EmptyState message="No profiles yet. Import a ROM to get started." />}
      {profiles.map((profile) => (
        <ListItemRow
          key={profile.id}
          icon={<Icon name="user" />}
          name={
            <>
              {profile.name}
              {profile.automation && <Status tone="neutral">Agent</Status>}
            </>
          }
          meta={`${profile.romFile.replace(/\.(sfc|smc)$/i, '')} · ${formatRelativeTime(profile.lastPlayed)}`}
          selected={selected === profile.id}
          onClick={() => onSelect(profile.id)}
          onDoubleClick={() => onOpen(profile)}
          action={
            <IconButton variant="ghost" size="sm" label="Delete" onClick={(e) => { e.stopPropagation(); onDelete(profile.id); }}>
              <Icon name="x" />
            </IconButton>
          }
        />
      ))}
    </Stack>
  );
};

export { ProfileRows };
