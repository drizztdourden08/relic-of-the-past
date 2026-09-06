/* @layer renderer-components @kind component */
/**
 * Randomizer page — one column, three tabs, each taking the full width: the
 * run and its frozen options, the live activity feed, and the spoiler (the
 * same checks tracker the widget renders).
 *
 * Sessions are owned by the shared session store and start automatically with
 * the game — nothing here starts one except the dev-only sandbox.
 */
import { useMemo, useState } from 'react';
import { Box, TabBar } from '@ds/primitives';
import type { TabItem } from '@ds/primitives';
import { useRandomizerSession } from './behavior/useRandomizerSession';
import { RunTab } from './sub-components/RunTab';
import { SpoilerPanel } from './sub-components/SpoilerPanel';
import { ActivityLog } from './sub-components/ActivityLog';
import './Randomizer.css';

interface RandomizerProps {
  activeProfile: Profile | null;
}

const Randomizer = ({ activeProfile }: RandomizerProps) => {
  const { session, placement, source, status, gameRunning, entries } = useRandomizerSession();
  const [tab, setTab] = useState('run');
  const config = activeProfile?.randomizer ?? null;

  const tabs: TabItem[] = useMemo(() => [
    { id: 'run', label: 'Run' },
    { id: 'logs', label: 'Logs' },
    { id: 'spoiler', label: 'Spoiler', badge: placement ? Object.keys(placement.nameView).length : undefined },
  ], [placement]);

  return (
    <Box className="randomizer-page">
      <TabBar tabs={tabs} activeTab={tab} onTabChange={setTab} />
      {tab === 'run' && (
        <RunTab
          profileName={activeProfile?.name ?? null}
          config={config}
          session={session}
          source={source}
          status={status}
          gameRunning={gameRunning}
        />
      )}
      {tab === 'logs' && <ActivityLog entries={entries} />}
      {tab === 'spoiler' && <SpoilerPanel />}
    </Box>
  );
};

export { Randomizer };
export type { RandomizerProps };
