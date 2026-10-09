/* @layer renderer-widgets @kind component */
import { useWidgetPref } from '@app/hooks/useWidgetPref';
import { Box } from '@ds/primitives';
import { TabBar } from '@ds/primitives/TabBar';
import { PlayerTab } from './tabs/PlayerTab';
import { ItemsTab } from './tabs/ItemsTab';
import { RulesTab } from './tabs/RulesTab';
import { ChecksTab } from './tabs/ChecksTab';
import { useCheatGates } from './behavior/useCheatGates';
import { TAB_IDS, TABS } from './CheatsWidget.constants';
import type { CheatTab } from './CheatsWidget.type';
import './CheatsWidget.css';

const CheatsWidgetContent = () => {
  const [storedTab, setTab] = useWidgetPref<CheatTab>('cheats', 'tab', 'player');
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
