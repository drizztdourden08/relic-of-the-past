/* @layer renderer-components @kind component */
import { ServerSetup } from '@app/compounds/ServerSetup';
import { absorbPort, withHost } from '@app/hooks/randomizer/server-setup/server-setup-draft';
import { useServerProbe } from '@app/hooks/randomizer/server-setup/useServerProbe';
import type { ServerSetupDraft } from '@app/hooks/randomizer/server-setup/server-setup-draft';
import type { ArchipelagoFieldsProps } from './ArchipelagoFields.type';

const ArchipelagoFields = ({ value, onChange }: ArchipelagoFieldsProps) => {
  const { server } = value;
  const probe = useServerProbe(server);
  const setServer = (next: ServerSetupDraft) => onChange({ server: next });

  return (
    <ServerSetup
      value={server}
      onChange={(part) => setServer({ ...server, ...part })}
      onHostChange={(host) => setServer(withHost(server, host))}
      onHostBlur={() => setServer(absorbPort(server))}
      probe={probe.state}
      onTest={() => void probe.test()}
    />
  );
};

export { ArchipelagoFields };
