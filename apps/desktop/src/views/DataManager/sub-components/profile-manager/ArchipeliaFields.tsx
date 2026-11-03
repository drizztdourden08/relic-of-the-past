/* @layer renderer-components @kind component */
import { useEffect, useState } from 'react';
import { LobbySetup } from '@app/compounds/LobbySetup';
import {
  browseServersOf, connectModeOf, lobbyRefOf, lobbyServerOf, useBrowsedLobbies, useBundledVersions, useLanServers, useLobbyCheck,
  useNetworkAccess,
} from '@app/hooks/randomizer/lobby-setup';
import { lobbyLineOf } from './lobby-line-of';
import { lobbyRowsOf } from './lobby-rows-of';
import type { ArchipeliaFieldsProps } from './ArchipelagoFields.type';

const ArchipeliaFields = ({ value, onChange, joining = false }: ArchipeliaFieldsProps) => {
  const draft = value.lobby;
  const auto = connectModeOf(draft) === 'auto';
  const [refresh, setRefresh] = useState(0);
  const lan = useLanServers(draft.location === 'lan' && auto, refresh);
  const { entries, loading } = useBrowsedLobbies(browseServersOf(draft, lan), refresh);
  const network = useNetworkAccess(auto);
  const versions = useBundledVersions();
  const check = useLobbyCheck(lobbyServerOf(draft), lobbyRefOf(draft));

  useEffect(() => {
    if (value.lobbyCheck !== check) onChange({ lobbyCheck: check });
  }, [check, value.lobbyCheck, onChange]);

  const onRefresh = (): void => {
    setRefresh((count) => count + 1);
    network.recheck();
  };

  const onAllow = (): void => {
    network.allow();
    setRefresh((count) => count + 1);
  };

  return (
    <LobbySetup
      value={draft}
      onChange={(part) => onChange({ lobby: { ...draft, ...part } })}
      lobbies={lobbyRowsOf(entries, versions)}
      lobby={lobbyLineOf(check)}
      access={{ refreshing: loading, onRefresh, blocked: network.status === 'blocked', onAllow }}
      disabled={joining}
    />
  );
};

export { ArchipeliaFields };
