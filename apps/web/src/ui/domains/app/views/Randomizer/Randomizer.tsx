/* @layer renderer-components @kind component */
import { useCallback, useMemo, useState } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box } from '@ds/primitives';
import { SectionNav, type SectionNavConfig } from '@ds/composites/SectionNav';
import { useRandomizerSession } from './behavior/useRandomizerSession';
import { useRoomMessages } from './behavior/useRoomMessages';
import { useProfileConnection } from '@app/hooks/randomizer/useProfileConnection';
import { RandomizerPageContent } from './sub-components/RandomizerPageContent';
import { RANDOMIZER_NAV_GROUPS, RANDOMIZER_TABS } from './Randomizer.constants';
import type { RandomizerProps, RandomizerTab } from './Randomizer.type';
import './Randomizer.css';

const navItem = (tab: RandomizerTab) => ({
  id: tab,
  label: RANDOMIZER_TABS[tab].label,
  icon: <IconifyIcon icon={RANDOMIZER_TABS[tab].navIcon} />,
});

const navConfigFor = (archipelago: boolean): SectionNavConfig => ({
  groups: RANDOMIZER_NAV_GROUPS
    .map((group) => ({ ...group, tabs: group.tabs.filter((tab) => archipelago || !RANDOMIZER_TABS[tab].archipelagoOnly) }))
    .filter((group) => group.tabs.length > 0)
    .map((group) => ({ id: group.id, label: group.label, items: group.tabs.map(navItem) })),
});

const Randomizer = ({ activeProfile }: RandomizerProps) => {
  const { session, placement, source, status, gameRunning, entries } = useRandomizerSession();
  const roomLines = useRoomMessages(session);
  const [chosenTab, setTab] = useState<RandomizerTab>('run');
  const { config, saveConnection } = useProfileConnection(activeProfile);
  const archipelago = config?.mode === 'online';
  const tabDroppedWithArchipelago = RANDOMIZER_TABS[chosenTab].archipelagoOnly && !archipelago;
  const tab = tabDroppedWithArchipelago ? 'run' : chosenTab;
  const openNetwork = useCallback(() => setTab('network'), []);
  const openOptions = useCallback(() => setTab('options'), []);
  const openLog = useCallback(() => setTab('logs'), []);
  const selectTab = useCallback((id: string) => setTab(id as RandomizerTab), []);
  const navConfig = useMemo(() => navConfigFor(archipelago), [archipelago]);
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
    <Box className="randomizer-page">
      <SectionNav config={navConfig} activeId={tab} onSelect={selectTab} />
      <Box className="randomizer-page__content">
        <RandomizerPageContent
          tab={tab}
          run={run}
          options={options}
          network={network}
          online={online}
          log={log}
          placedCount={placement ? Object.keys(placement.locations).length : null}
        />
      </Box>
    </Box>
  );
};

export { Randomizer };
export type { RandomizerProps };
