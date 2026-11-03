/* @layer renderer-components @kind component */
import { useEffect } from 'react';
import { LobbySetup } from '@app/compounds/LobbySetup';
import {
  browseServersOf, connectModeOf, lobbyRefOf, lobbyServerOf, useBrowsedLobbies, useBundledVersions, useLanServers, useLobbyCheck,
} from '@app/hooks/randomizer/lobby-setup';
import { lobbyLineOf } from './lobby-line-of';
import { lobbyRowsOf } from './lobby-rows-of';
import type { ArchipeliaFieldsProps } from './ArchipelagoFields.type';

const ArchipeliaFields = ({ value, onChange, joining = false }: ArchipeliaFieldsProps) => {
  const draft = value.lobby;
  const lan = useLanServers(draft.location === 'lan' && connectModeOf(draft) === 'auto');
  const entries = useBrowsedLobbies(browseServersOf(draft, lan));
  const versions = useBundledVersions();
  const check = useLobbyCheck(lobbyServerOf(draft), lobbyRefOf(draft));

  useEffect(() => {
    if (value.lobbyCheck !== check) onChange({ lobbyCheck: check });
  }, [check, value.lobbyCheck, onChange]);

  return (
    <LobbySetup
      value={draft}
      onChange={(part) => onChange({ lobby: { ...draft, ...part } })}
      lobbies={lobbyRowsOf(entries, versions)}
      lobby={lobbyLineOf(check)}
      disabled={joining}
    />
  );
};

export { ArchipeliaFields };
