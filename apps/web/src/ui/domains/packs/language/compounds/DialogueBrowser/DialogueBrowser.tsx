/* @layer renderer-components @kind component */
import { useMemo, useState } from 'react';
import { Box, Tabs } from '@drizztdourden08/tessera/primitives';
import { useSetVariables } from '../../behavior/useSetVariables';
import { DialogueList } from './sub-components/DialogueList';
import { VariablesPane } from './sub-components/VariablesPane';
import type { TabItem } from '@drizztdourden08/tessera/primitives';
import type { BrowserTab, DialogueBrowserProps } from './DialogueBrowser.type';
import './DialogueBrowser.css';

const DialogueBrowser = (props: DialogueBrowserProps) => {
  const { set, font, className } = props;
  const [tab, setTab] = useState<BrowserTab>('dialogue');
  const vars = useSetVariables(set);

  const tabs = useMemo<TabItem[]>(() => [
    { id: 'dialogue', label: 'Dialogue', badge: set.dialogue.length },
    { id: 'variables', label: 'Variables', badge: vars.variables.length },
  ], [set.dialogue.length, vars.variables.length]);

  return (
    <Box className={`dialogue-browser${className ? ` ${className}` : ''}`}>
      <Tabs tabs={tabs} activeTab={tab} onTabChange={(id) => setTab(id as BrowserTab)} />
      {tab === 'dialogue' ? <DialogueList set={set} font={font} vars={vars} /> : null}
      {tab === 'variables' ? <VariablesPane dialogue={set.dialogue} vars={vars} /> : null}
    </Box>
  );
};

export { DialogueBrowser };
