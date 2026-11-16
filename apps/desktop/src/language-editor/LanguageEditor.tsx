/* @layer renderer-components @kind component */
import { useMemo, useState } from 'react';
import { Center, EmptyState, Spinner } from '@drizztdourden08/tessera/primitives';
import { StudioLayout } from '@drizztdourden08/tessera/composites';
import { STUDIO_EDITOR_MIN_WIDTH, StudioPane, StudioPanelContent } from '@app/studio';
import { useLanguageEditor } from './behavior/useLanguageEditor';
import { useDialogueView } from './behavior/useDialogueView';
import { useEditorTabs } from './behavior/useEditorTabs';
import { useVariablesTab } from './behavior/useVariablesTab';
import { useSetExport } from './behavior/useSetExport';
import { useTextGroups } from './behavior/useTextGroups';
import { useStudioActions } from './behavior/studio-frame/useStudioActions';
import { EditorPanes } from './sub-components/EditorPanes';
import { StaleGameNotice } from './sub-components/StaleGameNotice';
import { LanguageProperties } from './sub-components/studio-frame/LanguageProperties';
import { sectionToolGroups } from './sub-components/studio-frame/section-tool-groups';
import { StudioStatus } from './sub-components/studio-frame/StudioStatus';
import { EDITOR_LABEL, PROPERTIES_PANEL, STUDIO_LABEL, UNREADABLE_SET } from './sub-components/studio-frame/studio-frame.constants';
import { FindHardcodedDialog } from './sub-components/variables';
import type { LanguageEditorProps } from './LanguageEditor.type';
import './LanguageEditor.css';

const LanguageEditor = (props: LanguageEditorProps) => {
  const { id, readOnly = false, origin = null } = props;
  const editor = useLanguageEditor(id, readOnly);
  const { set, loading, error, dirty, saving, saveError, issues, variables, terms, saveNow } = editor;

  const [tab, setTab] = useState('dialogue');
  const { dialogue, selection, find, tabProps } = useDialogueView({ id, set, issues, variables, terms, setEntryTokens: editor.setEntryTokens });
  const variablesTab = useVariablesTab({ dialogue, variables, onRewrite: editor.setManyEntryTokens });
  const { exporting, exportStatus, exportSet } = useSetExport({ id, dirty, saveNow });
  const text = useTextGroups(set, editor.setTextValue);
  const tabs = useEditorTabs({ dialogueCount: dialogue.length, variableCount: variables.length, groups: text.groups });
  const warnings = useMemo(() => Object.values(issues).filter((entry) => entry.length > 0).length, [issues]);
  const actions = useStudioActions({ readOnly, dirty, saving, exporting, onSave: saveNow, onExport: exportSet });

  if (loading) return <Center><Spinner /></Center>;
  if (error || !set) return <EmptyState message={error ?? UNREADABLE_SET} />;

  const properties = (
    <LanguageProperties
      set={set}
      warnings={warnings}
      selection={tab === 'dialogue' ? selection : null}
      readOnly={readOnly}
      onNote={editor.setEntryNote}
    />
  );

  return (
    <StudioPane
      label={STUDIO_LABEL}
      actions={actions}
      status={<StudioStatus exportStatus={exportStatus} saveError={saveError} readOnly={readOnly} saving={saving} dirty={dirty} />}
      banner={<><StaleGameNotice />{origin}</>}
      className="language-studio"
    >
      <StudioLayout
        editorLabel={EDITOR_LABEL}
        compactToolbar
        editorMinWidth={STUDIO_EDITOR_MIN_WIDTH}
        toolbar={sectionToolGroups({
          tabs,
          tab,
          query: find.query,
          filter: find.filter,
          onTabChange: setTab,
          onQueryChange: find.setQuery,
          onFilterChange: find.setFilter,
        })}
        end={{ ...PROPERTIES_PANEL, content: <StudioPanelContent>{properties}</StudioPanelContent> }}
      >
        <EditorPanes tab={tab} readOnly={readOnly} editor={editor} dialogue={tabProps} variablesTab={variablesTab} text={text} />
      </StudioLayout>

      <FindHardcodedDialog
        open={variablesTab.scanOpen}
        groups={variablesTab.groups}
        onApply={variablesTab.applyScan}
        onClose={variablesTab.closeScan}
      />
    </StudioPane>
  );
};

export { LanguageEditor };
