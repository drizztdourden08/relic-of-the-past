/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { EntryMetaPanel } from './EntryMetaPanel';
import { entryRowModel } from './entry-row-model';
import { issueWords } from './issue-words';
import { metaRowsForEntry } from './meta-rows-for-entry';
import type { EntryFactsProps } from './entry.type';
import './EntryFacts.css';

const EntryFacts = (props: EntryFactsProps) => {
  const { entry, layout, variables, issues } = props;

  const model = useMemo(() => entryRowModel({
    entry, blocks: layout.blocks, lineCount: layout.lines.length, variables, issues,
  }), [entry, layout.blocks, layout.lines.length, variables, issues]);
  const rows = useMemo(() => metaRowsForEntry(entry, layout, variables), [entry, layout, variables]);

  return (
    <>
      <Box className="entry-facts__head">
        <Text as="span" className="entry-facts__id">{model.idLabel}</Text>
        {model.who ? <Text as="span" className="entry-facts__who">{model.who}</Text> : null}
      </Box>
      <EntryMetaPanel rows={rows} issues={(issues ?? []).map(issueWords)} />
    </>
  );
};

export { EntryFacts };
