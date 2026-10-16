/* @layer renderer-components @kind component */
import { structuralEntry } from '@rotp/languages';
import { EntryListItem, PreviewView } from '@rotp/design/packs';
import { EntryEditor } from './EntryEditor';
import { LockedEntryCard } from './LockedEntryCard';
import type { DialogueEntryRowProps } from './DialogueEntryRow.type';

const DialogueEntryRow = (props: DialogueEntryRowProps) => {
  const {
    entry, issues, cfg, glossary, variables, variableIndex, metrics, sheet, layout, draft, view,
    structureMode, readOnly, onOpen, onClose, onModeChange, onChangeStructureMode,
  } = props;

  const locked = structuralEntry(entry.id);
  if (locked) return <LockedEntryCard id={entry.id} reason={locked.reason} />;

  const open = view.isOpen(entry.id);
  const mode = view.modeOf(entry.id);
  const drafted = draft.tokensOf(entry.id);
  const entryLayout = drafted === null ? layout.layoutFor(entry) : layout.layoutOf(drafted);
  const editing = open && mode === 'edit' && drafted !== null && cfg !== null;

  return (
    <EntryListItem
      entry={entry}
      layout={entryLayout}
      variables={variableIndex}
      issues={issues[entry.id]}
      open={open}
      mode={mode}
      showFacts={false}
      editor={editing ? (
        <EntryEditor
          tokens={drafted}
          rows={entryLayout.rows}
          cfg={cfg}
          glossary={glossary}
          variables={variables}
          metrics={metrics}
          sheet={sheet}
          structureMode={structureMode}
          dirty={draft.isDirty(entry.id)}
          readOnly={readOnly}
          onChangeTokens={(next) => draft.setTokens(entry.id, next)}
          onChangeStructureMode={onChangeStructureMode}
          onSave={() => draft.commit(entry.id)}
          onCancel={() => draft.cancel(entry.id)}
        />
      ) : null}
      preview={open && mode === 'preview' ? (
        <PreviewView
          blocks={entryLayout.blocks}
          terms={glossary}
          metrics={metrics}
          sheet={sheet}
        />
      ) : null}
      onOpen={onOpen}
      onClose={onClose}
      onModeChange={onModeChange}
    />
  );
};

export { DialogueEntryRow };
