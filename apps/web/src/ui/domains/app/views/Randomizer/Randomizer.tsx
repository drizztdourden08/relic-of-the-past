/* @layer renderer-components @kind component */
/**
 * Randomizer page, laid out like the profile hub: the section nav beside one page per tab. The
 * run with a summary of its options, the frozen options themselves (the creation panel, read-only),
 * the live activity feed and the spoiler (the same checks tracker the widget renders), plus the
 * network and the online settings for an Archipelago profile.
 *
 * Sessions are owned by the shared session store and start automatically with
 * the game, and nothing here starts one except the dev-only sandbox.
 */
import { useCallback, useMemo, useState } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box } from '@ds/primitives';
import { SectionNav, type SectionNavConfig } from '@ds/composites/SectionNav';
import { useRandomizerSession } from './behavior/useRandomizerSession';
import { useRoomMessages } from './behavior/useRoomMessages';
import { useProfileConnection } from '@app/hooks/randomizer/useProfileConnection';
import { RandomizerPageContent } from './sub-components/RandomizerPageContent';
import { RANDOMIZER_NAV_GROUPS, RANDOMIZER_TABS } from './Randomizer.constants';
import type { RandomizerTab } from './Randomizer.constants';
import './Randomizer.css';

interface RandomizerProps {
  activeProfile: Profile | null;
}

const navItem = (tab: RandomizerTab) => ({
  id: tab,
  label: RANDOMIZER_TABS[tab].label,
  icon: <IconifyIcon icon={RANDOMIZER_TABS[tab].navIcon} />,
});

/** The nav for this profile: the Archipelago group only for an Archipelago profile. */
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
  // A profile switch away from Archipelago drops the Network and Online pages; their bodies go with them.
  const tab = RANDOMIZER_TABS[chosenTab].archipelagoOnly && !archipelago ? 'run' : chosenTab;
  const openNetwork = useCallback(() => setTab('network'), []);
  const openOptions = useCallback(() => setTab('options'), []);
  const openLog = useCallback(() => setTab('logs'), []);
  const navConfig = useMemo(() => navConfigFor(archipelago), [archipelago]);
  const log = useMemo(() => ({ entries, roomLines }), [entries, roomLines]);

  const run = {
    profileId: activeProfile?.id ?? null,
    profileName: activeProfile?.name ?? null,
    config, session, source, status, gameRunning, log,
    onOpenNetwork: openNetwork,
    onOpenOptions: openOptions,
    onOpenLog: openLog,
  };

  return (
    <Box className="randomizer-page">
      <SectionNav config={navConfig} activeId={tab} onSelect={(id) => setTab(id as RandomizerTab)} />
      <Box className="randomizer-page__content">
        <RandomizerPageContent
          tab={tab}
          run={run}
          options={{ config, romFile: activeProfile?.romFile ?? null }}
          network={{ config, onSaveConnection: saveConnection }}
          online={{ profile: activeProfile }}
          log={log}
          placedCount={placement ? Object.keys(placement.locations).length : null}
        />
      </Box>
    </Box>
  );
};

export { Randomizer };
export type { RandomizerProps };
