/* @layer renderer-components @kind component */
/**
 * The creation form's Archipelago part: the server setup the Network tab also edits later,
 * with its Test connection, then the two session switches a new profile starts with. After
 * creation both switches live in the profile's Online settings.
 */
import { Toggle } from '@ds/primitives';
import { ServerSetup } from '@domains/app/compounds/ServerSetup';
import { absorbPort, withHost } from '@app/hooks/randomizer/server-setup/server-setup-draft';
import { useServerProbe } from '@app/hooks/randomizer/server-setup/useServerProbe';
import type { ServerSetupDraft } from '@app/hooks/randomizer/server-setup/server-setup-draft';
import type { RandomizerFormState } from './build-randomizer-config';

interface ArchipelagoFieldsProps {
  value: RandomizerFormState;
  onChange: (part: Partial<RandomizerFormState>) => void;
}

const ArchipelagoFields = ({ value, onChange }: ArchipelagoFieldsProps) => {
  const { server } = value;
  const probe = useServerProbe(server);
  const setServer = (next: ServerSetupDraft) => onChange({ server: next });

  return (
    <>
      <ServerSetup
        value={server}
        onChange={(part) => setServer({ ...server, ...part })}
        onHostChange={(host) => setServer(withHost(server, host))}
        onHostBlur={() => setServer(absorbPort(server))}
        probe={probe.state}
        onTest={() => void probe.test()}
      />
      <Toggle label="DeathLink" checked={value.deathLink} onChange={(deathLink) => onChange({ deathLink })} />
      <Toggle
        label="Track other players" checked={value.trackOtherPlayers}
        onChange={(trackOtherPlayers) => onChange({ trackOtherPlayers })}
      />
    </>
  );
};

export { ArchipelagoFields };
export type { ArchipelagoFieldsProps };
