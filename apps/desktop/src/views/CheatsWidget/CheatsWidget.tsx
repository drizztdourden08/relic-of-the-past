/* @layer renderer-widgets @kind component */
import { useWidgetPref } from '@drizztdourden08/brock-react';
import { Box, EmptyState, Tabs } from '@drizztdourden08/tessera/primitives';
import { useSpriteAvailabilityStore } from '@app/stores/sprite-availability-store';
import { PlayerTab } from './sub-components/PlayerTab';
import { ItemsTab } from './sub-components/ItemsTab';
import { RulesTab } from './sub-components/RulesTab';
import { ChecksTab } from './sub-components/ChecksTab';
import { useCheatGates } from './behavior/useCheatGates';
import { TAB_IDS, TABS } from './CheatsWidget.constants';
import type { CheatGates, CheatTab } from './CheatsWidget.type';
import './CheatsWidget.css';

const contentForTab = (tab: CheatTab, gates: CheatGates, spritesAvailable: boolean) => {
  if (tab === 'checks') return <ChecksTab gates={gates} />;
  if (!spritesAvailable) return <EmptyState message="Load a ROM to see the game sprites." />;
  if (tab === 'player') return <PlayerTab gates={gates} />;
  if (tab === 'items') return <ItemsTab gates={gates} />;
  return <RulesTab gates={gates} />;
};

const CheatsWidgetContent = () => {
  const [storedTab, setTab] = useWidgetPref<CheatTab>('cheats', 'tab', 'player');
  const tab: CheatTab = TAB_IDS.has(storedTab) ? storedTab : 'player';
  const gates = useCheatGates();
  const spritesAvailable = useSpriteAvailabilityStore((state) => state.available);

  return (
    <Box className="cheats-widget">
      <Tabs tabs={TABS} activeTab={tab} onTabChange={(id) => setTab(id as CheatTab)} />
      <Box className="cheats-widget__content">{contentForTab(tab, gates, spritesAvailable)}</Box>
    </Box>
  );
};

export { CheatsWidgetContent };
