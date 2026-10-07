/* @layer renderer-components @kind component */
/**
 * A language set, read only: the dialogue with its search and in-game preview, and the
 * variables. The app's editor draws the same entries, reads and previews; this adds no editing.
 */
import { useMemo, useState } from 'react';
import { Box, TabBar } from '@ds/primitives';
import { useSetVariables } from '../../behavior/useSetVariables';
import { DialogueList } from './sub-components/DialogueList';
import { VariablesPane } from './sub-components/VariablesPane';
import type { TabItem } from '@ds/primitives';
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
      <TabBar tabs={tabs} activeTab={tab} onTabChange={(id) => setTab(id as BrowserTab)} />
      {tab === 'dialogue' ? <DialogueList set={set} font={font} vars={vars} /> : null}
      {tab === 'variables' ? <VariablesPane dialogue={set.dialogue} vars={vars} /> : null}
    </Box>
  );
};

export { DialogueBrowser };
