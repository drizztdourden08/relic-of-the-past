/* @layer renderer-components @kind component */
/**
 * One item of the entry list: the closed row, or the open panel and whichever of
 * the three views it is showing.
 *
 * It exists so the list itself stays a list. Choosing between four renderings and
 * assembling the model for each is per-entry work, and doing it here keeps the tab
 * to searching, filtering and iterating.
 *
 * The measurements are taken from the shared layout cache, and only for a row near
 * the viewport: a set is a few hundred entries and measuring one means walking
 * every glyph through the language's width table.
 */
import { memo, useCallback, useMemo } from 'react';
import { contextFor } from '@shared/game/data/dialogue-context';
import { EntryCardCollapsed } from './EntryCardCollapsed';
import { EntryPanel } from './EntryPanel';
import { ReadView } from './ReadView';
import { entryMetaRows, issueWords } from './entry-meta.model';
import { entryRowModel } from './entry-row.model';
import { proseOf } from './entry-prose';
import { factsForEntry } from './trigger-facts';
import type { ReactNode } from 'react';
import type { DialogueEntry, EntryIssue, VariableIndex } from '@shared/game/language';
import type { EntryLayout } from '../../behavior/useEntryLayout';
import type { EntryViewMode } from '../../behavior/useEntryView';

type EntryListItemProps = {
  entry: DialogueEntry;
  /** Rows, lines and blocks for this entry; empty while it is out of view. */
  layout: EntryLayout;
  variables: VariableIndex;
  issues?: EntryIssue[];
  open: boolean;
  mode: EntryViewMode;
  /** The editing surface, built by the tab — absent unless this entry is editing. */
  editor?: ReactNode;
  /** The box preview, built by the tab — absent unless this entry is previewing. */
  preview?: ReactNode;
  onOpen: (id: number) => void;
  onClose: (id: number) => void;
  onModeChange: (id: number, mode: EntryViewMode) => void;
};

/*
 * Memoized: the list holds a few hundred of these and re-renders on every mode
 * or draft change. A closed row's props are all stable (models come from the
 * shared layout cache, handlers are identity-fixed), so only the row whose
 * facts changed pays for the change.
 */
const EntryListItem = memo((props: EntryListItemProps) => {
  const {
    entry, layout, variables, issues, open, mode,
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
export type { EntryListItemProps };
