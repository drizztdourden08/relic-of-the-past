/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import { useRandomizerSession } from './behavior/useRandomizerSession';
import { useRoomMessages } from './behavior/useRoomMessages';
import { useProfileConnection } from '@app/hooks/randomizer/useProfileConnection';
import { useGameSession } from '@app/hooks/useGameSession';
import { RANDOMIZER_BUCKET } from './Randomizer.constants';
import { RandomizerPageContent } from './sub-components/RandomizerPageContent';
import type { RandomizerProps } from './Randomizer.type';
import './Randomizer.css';

const Randomizer = (props: RandomizerProps) => {
  const { tab, open } = props;
  const { activeProfile } = useGameSession().profileMgmt;
  const { session, placement, source, status, gameRunning, entries } = useRandomizerSession();
  const roomLines = useRoomMessages(session);
  const { config, saveConnection } = useProfileConnection(activeProfile);
  const openNetwork = useCallback(() => open(`${RANDOMIZER_BUCKET}/network`), [open]);
  const openOptions = useCallback(() => open(`${RANDOMIZER_BUCKET}/options`), [open]);
  const openLog = useCallback(() => open(`${RANDOMIZER_BUCKET}/logs`), [open]);
  const log = useMemo(() => ({ entries, roomLines }), [entries, roomLines]);
  const profileId = activeProfile?.id ?? null;
  const profileName = activeProfile?.name ?? null;
  const romFile = activeProfile?.romFile ?? null;

  const run = useMemo(() => ({
    profileId,
    profileName,
    config, session, source, status, gameRunning, log,
    onOpenNetwork: openNetwork,
    onOpenOptions: openOptions,
    onOpenLog: openLog,
  }), [profileId, profileName, config, session, source, status, gameRunning, log, openNetwork, openOptions, openLog]);
  const options = useMemo(() => ({ config, romFile }), [config, romFile]);
  const network = useMemo(() => ({ config, onSaveConnection: saveConnection }), [config, saveConnection]);
  const online = useMemo(() => ({ profile: activeProfile }), [activeProfile]);

  return (
    <RandomizerPageContent
      tab={tab}
      archipelago={config?.mode === 'online'}
      run={run}
      options={options}
      network={network}
      online={online}
      log={log}
      placedCount={placement ? Object.keys(placement.locations).length : null}
    />
  );
};

export { Randomizer };
