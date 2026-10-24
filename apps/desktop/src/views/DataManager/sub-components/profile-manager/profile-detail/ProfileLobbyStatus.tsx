/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Button, Flex, Icon, ProgressBar, Spinner, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { FactsPanel } from '@drizztdourden08/tessera/composites';
import { useLobbyStatusStore } from '@app/stores/lobby-status-store';
import { convertToLocal } from './convert-to-local';
import { lobbyStatusLine } from './lobby-status-line';
import type { ProfileLobbyStatusProps } from './lobby-status-line.type';

const ProfileLobbyStatus = ({ profile, onDelete }: ProfileLobbyStatusProps) => {
  const membership = useLobbyStatusStore((state) => state.members[profile.id]);
  const live = useLobbyStatusStore((state) => state.live[profile.id]);
  const [converting, setConverting] = useState(false);
  if (membership === undefined) return null;
  const line = lobbyStatusLine(membership, live);

  const changeToLocal = () => {
    setConverting(true);
    void convertToLocal(profile).finally(() => setConverting(false));
  };

  return (
    <Stack gap="sm" className="profile-lobby-status">
      <Flex gap="sm" align="center" wrap>
        {line.busy && <Spinner size="sm" />}
        <Text tone={line.tone === 'neutral' ? undefined : line.tone}>{line.text}</Text>
        {line.why !== undefined && line.why !== '' && <Text tone="muted">{line.why}</Text>}
        {line.progress !== undefined && <ProgressBar value={line.progress} max={1} showValue />}
        {line.final && (
          <Flex gap="sm" className="profile-lobby-status__actions">
            <Button variant="secondary" size="sm" loading={converting} onClick={changeToLocal}>Change to Local</Button>
            <Button variant="danger" size="sm" icon={<Icon name="trash-2" />} onClick={onDelete}>Delete</Button>
          </Flex>
        )}
      </Flex>
      <FactsPanel
        groups={[[
          { label: 'Server', value: membership.server, mono: true },
          { label: 'Lobby', value: membership.lobbyName },
          { label: 'Code', value: membership.code, mono: true, copyable: true },
          { label: 'Archipelago', value: membership.ap, mono: true },
          { label: 'Slot', value: profile.randomizer?.slotName ?? '' },
        ]]}
      />
    </Stack>
  );
};

export { ProfileLobbyStatus };
