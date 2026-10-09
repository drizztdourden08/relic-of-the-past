/* @layer renderer-components @kind component */
import { useCallback, useMemo, useState } from 'react';
import { Box, EmptyState, SectionHeader, TextInput } from '@drizztdourden08/tessera/primitives';
import { EntryListItem } from '../../../entry';
import { PreviewView } from '../../../preview';
import { useEntryLayout } from '../../../../behavior/useEntryLayout';
import { useEntryView } from '../../../../behavior/useEntryView';
import { useTranslationSearch } from '../../../../behavior/useTranslationSearch';
import { filterEntriesByHits } from '../../../../behavior/entry-selectors';
import { MODES_WITH_FONT, MODES_WITHOUT_FONT } from '../../DialogueBrowser.constants';
import type { ChangeEvent } from 'react';
import type { DialogueListProps } from '../../DialogueBrowser.type';

const DialogueList = (props: DialogueListProps) => {
  const { set, font, vars } = props;
  const [query, setQuery] = useState('');
  const search = useTranslationSearch(set, query);
  const view = useEntryView();
  const metrics = font?.metrics ?? null;
  const layout = useEntryLayout(metrics, vars.terms);

  const entries = useMemo(
    () => filterEntriesByHits(set.dialogue, search.hits, search.applied),
    [set.dialogue, search.hits, search.applied],
  );
  const handleQuery = useCallback((event: ChangeEvent<HTMLInputElement>) => setQuery(event.currentTarget.value), []);

  const total = set.dialogue.length;
  const searching = query.trim().length > 0;
  const modes = font ? MODES_WITH_FONT : MODES_WITHOUT_FONT;

  return (
    <Box className="dialogue-browser__list">
      <SectionHeader
        title={searching ? `${entries.length} of ${total} lines` : `${total} lines`}
        action={<TextInput value={query} onChange={handleQuery} placeholder="Search the texts..." />}
      />
      <Box className="dialogue-browser__scroll">
        {entries.length === 0 ? <EmptyState message={searching ? 'No line matches' : 'This set has no dialogue'} /> : null}
        {entries.map((entry) => {
          const open = view.isOpen(entry.id);
          const mode = view.modeOf(entry.id);
          const entryLayout = layout.layoutFor(entry);
          return (
            <EntryListItem
              key={entry.id}
              entry={entry}
              layout={entryLayout}
              variables={vars.index}
              open={open}
              mode={mode}
              modes={modes}
              preview={open && mode === 'preview' && font ? (
                <PreviewView blocks={entryLayout.blocks} terms={vars.terms} metrics={font.metrics} sheet={font.sheet} />
              ) : null}
              onOpen={view.open}
              onClose={view.close}
              onModeChange={view.setMode}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export { DialogueList };
