/* @layer renderer-components @kind component */
import { memo, useCallback, useMemo } from 'react';
import { EntryCardCollapsed } from './EntryCardCollapsed';
import { EntryPanel } from './EntryPanel';
import { ReadView } from './ReadView';
import { issueWords } from './issue-words';
import { entryRowModel } from './entry-row-model';
import { proseOf } from './entry-prose';
import { metaRowsForEntry } from './meta-rows-for-entry';
import type { EntryViewMode } from '../../behavior/language-behavior.type';
import type { EntryListItemProps } from './entry.type';

const EntryListItem = memo((props: EntryListItemProps) => {
  const {
    entry, layout, variables, issues, open, mode, modes, showFacts = true,
    editor, preview, onOpen, onClose, onModeChange,
  } = props;

  const handleClose = useCallback(() => onClose(entry.id), [entry.id, onClose]);
  const handleMode = useCallback(
    (next: EntryViewMode) => onModeChange(entry.id, next),
    [entry.id, onModeChange],
  );

  const model = useMemo(() => entryRowModel({
    entry, blocks: layout.blocks, lineCount: layout.lines.length, variables, issues,
  }), [entry, layout.blocks, layout.lines.length, variables, issues]);

  if (!open) {
    return <EntryCardCollapsed model={model} rows={layout.rows} onOpen={onOpen} />;
  }

  return (
    <EntryPanel
      idLabel={model.idLabel}
      who={model.who}
      metaRows={showFacts ? metaRowsForEntry(entry, layout, variables) : null}
      issues={(issues ?? []).map(issueWords)}
      mode={mode}
      modes={modes}
      onModeChange={handleMode}
      onClose={handleClose}
    >
      {mode === 'edit' ? editor : null}
      {mode === 'preview' ? preview : null}
      {mode === 'read' ? (
        <ReadView prose={proseOf(entry.tokens, variables)} note={entry.note} />
      ) : null}
    </EntryPanel>
  );
});

EntryListItem.displayName = 'EntryListItem';

export { EntryListItem };
