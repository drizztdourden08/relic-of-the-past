/* @layer renderer-widgets @kind component */
/**
 * The cheat console: the game's own HUD and pause menu, made clickable.
 * Tabs: Player (life, magic, counters, bottles), Items (the pause grid and its panels),
 * Rules (state and combat cheats as tiles), Checks (grant what a location holds).
 */
import { useWidgetPref } from '@app/hooks/useWidgetPref';
import { Box } from '@ds/primitives';
import { TabBar } from '@ds/primitives/TabBar';
import { PlayerTab } from './tabs/PlayerTab';
import { ItemsTab } from './tabs/ItemsTab';
import { RulesTab } from './tabs/RulesTab';
import { ChecksTab } from './tabs/ChecksTab';
import { useCheatGates } from './behavior/useCheatGates';
import './CheatsWidget.css';

type CheatTab = 'player' | 'items' | 'rules' | 'checks';

const TABS = [
  { id: 'player', label: 'Player' },
  { id: 'items', label: 'Items' },
  { id: 'rules', label: 'Rules' },
  { id: 'checks', label: 'Checks' },
];

const TAB_IDS = new Set<string>(TABS.map((t) => t.id));

const CheatsWidgetContent = () => {
  const [storedTab, setTab] = useWidgetPref<CheatTab>('cheats', 'tab', 'player');
  // A profile written by the four-tab console of before may still name a tab that is gone.
  const tab: CheatTab = TAB_IDS.has(storedTab) ? storedTab : 'player';
  const gates = useCheatGates();

  return (
    <Box className="cheats-widget">
      <TabBar tabs={TABS} activeTab={tab} onTabChange={(id) => setTab(id as CheatTab)} />
      <Box className="cheats-widget__content">
        {tab === 'player' && <PlayerTab gates={gates} />}
        {tab === 'items' && <ItemsTab gates={gates} />}
        {tab === 'rules' && <RulesTab gates={gates} />}
        {tab === 'checks' && <ChecksTab gates={gates} />}
      </Box>
    </Box>
  );
};

export { CheatsWidgetContent };
