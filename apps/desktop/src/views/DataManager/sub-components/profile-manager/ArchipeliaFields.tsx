/* @layer renderer-components @kind component */
import { useEffect } from 'react';
import { LobbySetup } from '@app/compounds/LobbySetup';
import { lobbyCodeOf, lobbyServerOf, useBundledVersions, useLanServers, useLobbyCheck } from '@app/hooks/randomizer/lobby-setup';
import { lanRowsOf } from './lan-rows-of';
import { lobbyLineOf } from './lobby-line-of';
import type { ArchipeliaFieldsProps } from './ArchipelagoFields.type';

const ArchipeliaFields = ({ value, onChange, joining = false }: ArchipeliaFieldsProps) => {
  const draft = value.lobby;
  const servers = useLanServers(draft.location === 'lan');
  const versions = useBundledVersions();
  const check = useLobbyCheck(lobbyServerOf(draft, servers), lobbyCodeOf(draft.code));

  useEffect(() => {
    if (value.lobbyCheck !== check) onChange({ lobbyCheck: check });
  }, [check, value.lobbyCheck, onChange]);

  return (
    <LobbySetup
      value={draft}
      onChange={(part) => onChange({ lobby: { ...draft, ...part } })}
      servers={lanRowsOf(servers, versions)}
      lobby={lobbyLineOf(check)}
      disabled={joining}
    />
  );
};

export { ArchipeliaFields };
