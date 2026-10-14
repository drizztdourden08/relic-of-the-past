/* @layer renderer-components @kind component */
import { useMemo, useState } from 'react';
import { Box, Tabs, EmptyState, Spinner } from '@drizztdourden08/tessera/primitives';
import { useLanguageEditor } from './behavior/useLanguageEditor';
import { useDialogueView } from './behavior/useDialogueView';
import { useEditorTabs } from './behavior/useEditorTabs';
import { useVariablesTab } from './behavior/useVariablesTab';
import { useSetExport } from './behavior/useSetExport';
import { useTextGroups } from './behavior/useTextGroups';
import { BundleHeader } from './sub-components/BundleHeader';
import { EditorPanes } from './sub-components/EditorPanes';
import { StaleGameNotice } from './sub-components/StaleGameNotice';
import { FindHardcodedDialog } from './sub-components/variables';
import type { LanguageEditorProps } from './LanguageEditor.type';
import './LanguageEditor.css';

const LanguageEditor = (props: LanguageEditorProps) => {
  const { id, readOnly = false, origin = null } = props;
  const editor = useLanguageEditor(id, readOnly);
  const { set, loading, error, dirty, saving, saveError, issues, variables, terms, saveNow } = editor;

  const [tab, setTab] = useState('dialogue');
  const { dialogue, tabProps } = useDialogueView({ id, set, issues, variables, terms, setEntryTokens: editor.setEntryTokens });
  const variablesTab = useVariablesTab({ dialogue, variables, onRewrite: editor.setManyEntryTokens });
  const { exporting, exportStatus, exportSet } = useSetExport({ id, dirty, saveNow });
  const text = useTextGroups(set, editor.setTextValue);
  const tabs = useEditorTabs({ dialogueCount: dialogue.length, variableCount: variables.length, groups: text.groups });
  const warnings = useMemo(() => Object.values(issues).filter((list) => list.length > 0).length, [issues]);

  if (!id) return <EmptyState message="Select a language set to edit" />;
  if (loading) return <Spinner />;
  if (error || !set) return <EmptyState message={error ?? 'That language set could not be read'} />;

  return (
    <Box className="language-editor">
      <StaleGameNotice />
      {origin}
      <BundleHeader
        set={set}
        warnings={warnings}
        dirty={dirty}
        saving={saving}
        saveError={saveError}
        readOnly={readOnly}
        onSaveNow={saveNow}
        onExport={exportSet}
        exporting={exporting}
        exportStatus={exportStatus}
      />

      <Tabs tabs={tabs} activeTab={tab} onTabChange={setTab} />

      <EditorPanes
        tab={tab}
        readOnly={readOnly}
        editor={editor}
        dialogue={tabProps}
        variablesTab={variablesTab}
        text={text}
      />

      <FindHardcodedDialog
        open={variablesTab.scanOpen}
        groups={variablesTab.groups}
        onApply={variablesTab.applyScan}
        onClose={variablesTab.closeScan}
      />
    </Box>
  );
};

export { LanguageEditor };
