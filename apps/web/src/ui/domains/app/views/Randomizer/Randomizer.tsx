/* @layer renderer-components @kind component */
/**
 * Randomizer page. One column of tabs, each taking the full width: the run and
 * its frozen options, the network and the online settings (Archipelago profiles only), the live
 * activity feed, and the spoiler (the same checks tracker the widget renders).
 *
 * Sessions are owned by the shared session store and start automatically with
 * the game, and nothing here starts one except the dev-only sandbox.
 */
import { useCallback, useMemo, useState } from 'react';
import { Box, TabBar } from '@ds/primitives';
import type { TabItem } from '@ds/primitives';
import { useRandomizerSession } from './behavior/useRandomizerSession';
import { useRoomMessages } from './behavior/useRoomMessages';
import { useProfileConnection } from './behavior/useProfileConnection';
import { RunTab } from './sub-components/RunTab';
import { SpoilerPanel } from './sub-components/SpoilerPanel';
import { ActivityLog } from './sub-components/ActivityLog';
import { NetworkTab } from './sub-components/NetworkTab';
import { OnlineTab } from './sub-components/OnlineTab';
import './Randomizer.css';

interface RandomizerProps {
  activeProfile: Profile | null;
}

const Randomizer = ({ activeProfile }: RandomizerProps) => {
  const { session, placement, source, status, gameRunning, entries } = useRandomizerSession();
  const roomLines = useRoomMessages(session);
  const [chosenTab, setTab] = useState('run');
  const { config, saveConnection } = useProfileConnection(activeProfile);
  const archipelago = config?.mode === 'online';
  // A profile switch away from Archipelago drops the Network and Online tabs; their bodies go with them.
  const tab = (chosenTab === 'network' || chosenTab === 'online') && !archipelago ? 'run' : chosenTab;
  const openNetwork = useCallback(() => setTab('network'), []);

  const tabs: TabItem[] = useMemo(() => [
    { id: 'run', label: 'Run' },
    ...(archipelago ? [{ id: 'network', label: 'Network' }, { id: 'online', label: 'Online' }] : []),
    { id: 'logs', label: 'Logs' },
    { id: 'spoiler', label: 'Spoiler', badge: placement ? Object.keys(placement.locations).length : undefined },
  ], [placement, archipelago]);

  return (
    <Box className="randomizer-page">
      <TabBar tabs={tabs} activeTab={tab} onTabChange={setTab} />
      {tab === 'run' && (
        <RunTab
          profileId={activeProfile?.id ?? null}
          profileName={activeProfile?.name ?? null}
          config={config}
          session={session}
          source={source}
          status={status}
          gameRunning={gameRunning}
          onOpenNetwork={openNetwork}
        />
      )}
      {tab === 'network' && <NetworkTab config={config} onSaveConnection={saveConnection} />}
      {tab === 'online' && <OnlineTab />}
      {tab === 'logs' && <ActivityLog entries={entries} roomLines={roomLines} />}
      {tab === 'spoiler' && <SpoilerPanel />}
    </Box>
  );
};

export { Randomizer };
export type { RandomizerProps };
