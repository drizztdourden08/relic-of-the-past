/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Status, Box, Text } from '@drizztdourden08/tessera/primitives';
import { FactsPanel } from '@drizztdourden08/tessera/composites';
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import type { EntryMetaPanelProps, MetaRow } from './entry.type';
import './EntryMetaPanel.css';

const factOf = (row: MetaRow): FactsPanelFact => ({
  label: row.label,
  value: row.absent ? <Text as="span" className="entry-meta__absent">{row.value}</Text> : row.value,
  mono: row.mono,
});

const EntryMetaPanel = (props: EntryMetaPanelProps) => {
  const { rows, issues } = props;
  const groups = useMemo(() => [rows.map(factOf)], [rows]);

  return (
    <Box className="entry-meta">
      <FactsPanel layout="terms" groups={groups} />

      {issues.length > 0 ? (
        <Box className="entry-meta__issues">
          {issues.map((issue) => (
            <Status key={issue} tone="danger">{issue}</Status>
          ))}
        </Box>
      ) : null}
    </Box>
  );
};

export { EntryMetaPanel };
