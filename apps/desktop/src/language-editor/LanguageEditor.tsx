/* @layer renderer-components @kind component */
import { useMemo, useState } from 'react';
import { StudioFrame } from '@app/compounds/StudioFrame';
import { useLanguageEditor } from './behavior/useLanguageEditor';
import { useDialogueView } from './behavior/useDialogueView';
import { useEditorTabs } from './behavior/useEditorTabs';
import { useVariablesTab } from './behavior/useVariablesTab';
import { useSetExport } from './behavior/useSetExport';
import { useTextGroups } from './behavior/useTextGroups';
import { useStudioActions } from './behavior/studio-frame/useStudioActions';
import { useStudioToolbar } from './behavior/studio-frame/useStudioToolbar';
import { EditorPanes } from './sub-components/EditorPanes';
import { StaleGameNotice } from './sub-components/StaleGameNotice';
import { EditorBody } from './sub-components/studio-frame/EditorBody';
import { SetProperties } from './sub-components/studio-frame/SetProperties';
import { StudioNotices } from './sub-components/studio-frame/StudioNotices';
import { StudioStatus } from './sub-components/studio-frame/StudioStatus';
import {
  EDITOR_LABEL, IDLE_HINT, NO_SET_TITLE, PROPERTIES_PANEL_TITLE, SETS_PANEL_TITLE, STUDIO_CAPTION,
} from './sub-components/studio-frame/studio-frame.constants';
import { FindHardcodedDialog } from './sub-components/variables';
import type { LanguageEditorProps } from './LanguageEditor.type';
import './LanguageEditor.css';

const LanguageEditor = (props: LanguageEditorProps) => {
  const { id, list, readOnly = false, origin = null } = props;
  const editor = useLanguageEditor(id, readOnly);
  const { set, loading, error, dirty, saving, saveError, issues, variables, terms, saveNow } = editor;

  const [tab, setTab] = useState('dialogue');
  const { dialogue, find, tabProps } = useDialogueView({ id, set, issues, variables, terms, setEntryTokens: editor.setEntryTokens });
  const variablesTab = useVariablesTab({ dialogue, variables, onRewrite: editor.setManyEntryTokens });
  const { exporting, exportStatus, exportSet } = useSetExport({ id, dirty, saveNow });
  const text = useTextGroups(set, editor.setTextValue);
  const tabs = useEditorTabs({ dialogueCount: dialogue.length, variableCount: variables.length, groups: text.groups });
  const warnings = useMemo(() => Object.values(issues).filter((entry) => entry.length > 0).length, [issues]);

  const actions = useStudioActions({
    hasSet: set !== null, readOnly, dirty, saving, exporting, onSave: saveNow, onExport: exportSet,
  });
  const toolbar = useStudioToolbar({
    tabs, tab, query: find.query, filter: find.filter,
    onTabChange: setTab, onQueryChange: find.setQuery, onFilterChange: find.setFilter,
  });

  return (
    <StudioFrame
      caption={STUDIO_CAPTION}
      title={set?.name ?? NO_SET_TITLE}
      status={set && <StudioStatus origin={set.origin} warnings={warnings} saveError={saveError} readOnly={readOnly} saving={saving} dirty={dirty} />}
      groups={actions}
      idleHint={IDLE_HINT}
      notices={<StudioNotices exportStatus={exportStatus} />}
      banner={<><StaleGameNotice />{origin}</>}
      left={{ title: SETS_PANEL_TITLE, content: list }}
      right={set ? { title: PROPERTIES_PANEL_TITLE, content: <SetProperties set={set} warnings={warnings} /> } : undefined}
      editorLabel={EDITOR_LABEL}
      toolbar={set ? toolbar : undefined}
      className="language-editor"
    >
      <EditorBody id={id} loading={loading} error={error} ready={set !== null}>
        <EditorPanes tab={tab} readOnly={readOnly} editor={editor} dialogue={tabProps} variablesTab={variablesTab} text={text} />
      </EditorBody>

      <FindHardcodedDialog
        open={variablesTab.scanOpen}
        groups={variablesTab.groups}
        onApply={variablesTab.applyScan}
        onClose={variablesTab.closeScan}
      />
    </StudioFrame>
  );
};

export { LanguageEditor };
