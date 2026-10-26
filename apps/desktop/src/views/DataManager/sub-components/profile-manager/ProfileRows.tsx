/* @layer renderer-components @kind component */
import { Status, IconButton, EmptyState, Stack, Icon } from '@drizztdourden08/tessera/primitives';
import { DateText, ListItemRow } from '@drizztdourden08/tessera/composites';
import { useLobbyStatusStore } from '@app/stores/lobby-status-store';
import { lobbyRowChip } from './lobby-row-chip';
import type { ProfileRowsProps } from './profile-manager.type';

const ProfileRows = (props: ProfileRowsProps) => {
  const { profiles, selected, onSelect, onOpen, onDelete } = props;
  const members = useLobbyStatusStore((state) => state.members);

  return (
    <Stack gap="xs">
      {profiles.length === 0 && <EmptyState message="No profiles yet." />}
      {profiles.map((profile) => {
        const chip = profile.randomizer?.mode === 'archipelia' ? lobbyRowChip(members[profile.id]) : null;
        return (
          <ListItemRow
            key={profile.id}
            icon={<Icon name="user" />}
            name={
              <>
                {profile.name}
                {profile.automation && <Status tone="neutral">Agent</Status>}
                {chip !== null && <Status tone={chip.tone} variant="pill">{chip.label}</Status>}
              </>
            }
            meta={
              <>
                {(profile.romFile || 'No ROM selected').replace(/\.(sfc|smc)$/i, '')} ·{' '}
                {profile.lastPlayed ? <DateText value={profile.lastPlayed} format="relative" /> : 'Never'}
              </>
            }
            selected={selected === profile.id}
            onClick={() => onSelect(profile.id)}
            onDoubleClick={profile.randomizer?.mode === 'archipelia' ? undefined : () => onOpen(profile)}
            action={
              <IconButton variant="ghost" size="sm" label="Delete" onClick={(e) => { e.stopPropagation(); onDelete(profile.id); }}>
                <Icon name="x" />
              </IconButton>
            }
          />
        );
      })}
    </Stack>
  );
};

export { ProfileRows };
