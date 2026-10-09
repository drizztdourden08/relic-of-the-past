/* @layer renderer-components @kind component */
import { memo, useCallback, useMemo } from 'react';
import { contextFor } from '@rotp/game-data';
import { EntryCardCollapsed } from './EntryCardCollapsed';
import { EntryPanel } from './EntryPanel';
import { ReadView } from './ReadView';
import { entryMetaRows } from './entry-meta.model';
import { issueWords } from './issue-words';
import { entryRowModel } from './entry-row.model';
import { proseOf } from './entry-prose';
import { factsForEntry } from './facts-for-entry';
import type { EntryViewMode } from '../../behavior/language-behavior.type';
import type { EntryListItemProps } from './entry.type';

const EntryListItem = memo((props: EntryListItemProps) => {
  const {
    entry, layout, variables, issues, open, mode, modes,
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

  const metaRows = entryMetaRows({
    tokens: entry.tokens,
    facts: factsForEntry(entry.id),
    context: contextFor(entry.id) ?? null,
    blocks: layout.blocks,
    lineCount: layout.lines.length,
    variables,
  });

  return (
    <EntryPanel
      idLabel={model.idLabel}
      who={model.who}
      metaRows={metaRows}
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
