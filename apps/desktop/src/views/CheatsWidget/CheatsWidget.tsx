/* @layer renderer-widgets @kind component */
import { useWidgetPref } from '@drizztdourden08/brock-react';
import { Box, Tabs } from '@drizztdourden08/tessera/primitives';
import { PlayerTab } from './sub-components/PlayerTab';
import { ItemsTab } from './sub-components/ItemsTab';
import { RulesTab } from './sub-components/RulesTab';
import { ChecksTab } from './sub-components/ChecksTab';
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
      <Tabs tabs={TABS} activeTab={tab} onTabChange={(id) => setTab(id as CheatTab)} />
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
