/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Status, IconButton, EmptyState, Stack, Icon } from '@drizztdourden08/tessera/primitives';
import { DateText, ListItemRow } from '@drizztdourden08/tessera/composites';
import { useLobbyStatusStore } from '@drizztdourden08/brock-randomizer/renderer';
import { lobbyRowChip } from './lobby-row-chip';
import type { ProfileRowsProps } from './profile-manager.type';

const ProfileRows = (props: ProfileRowsProps) => {
  const t = useT();
  const { profiles, selected, onSelect, onOpen, onDelete } = props;
  const members = useLobbyStatusStore((state) => state.members);

  return (
    <Stack gap="xs">
      {profiles.length === 0 && <EmptyState message={t('data-manager:profile-manager.no-profiles-yet')} />}
      {profiles.map((profile) => {
        const chip = profile.randomizer?.mode === 'archipelia' ? lobbyRowChip(members[profile.id], t) : null;
        return (
          <ListItemRow
            key={profile.id}
            icon={<Icon name="user" />}
            name={
              <>
                {profile.name}
                {profile.automation && <Status tone="neutral">{t('data-manager:profile-manager.agent')}</Status>}
                {chip !== null && <Status tone={chip.tone} variant="pill">{chip.label}</Status>}
              </>
            }
            meta={
              <>
                {(profile.romFile || t('data-manager:profile-manager.no-rom')).replace(/\.(sfc|smc)$/i, '')} ·{' '}
                {profile.lastPlayed ? <DateText value={profile.lastPlayed} format="relative" /> : t('data-manager:profile-manager.never')}
              </>
            }
            selected={selected === profile.id}
            onClick={() => onSelect(profile.id)}
            onDoubleClick={profile.randomizer?.mode === 'archipelia' ? undefined : () => onOpen(profile)}
            action={
              <IconButton variant="ghost" size="sm" label={t('data-manager:profile-manager.delete')} onClick={(e) => { e.stopPropagation(); onDelete(profile.id); }}>
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
