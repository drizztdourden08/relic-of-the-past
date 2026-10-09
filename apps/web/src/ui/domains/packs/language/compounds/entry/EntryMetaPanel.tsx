/* @layer renderer-components @kind component */
import { Status, Box, Text } from '@drizztdourden08/tessera/primitives';
import type { EntryMetaPanelProps, MetaRow } from './entry.type';
import './EntryMetaPanel.css';

const cellClass = (row: MetaRow): string => [
  'entry-meta__value',
  row.mono ? 'entry-meta__value--mono' : '',
  row.absent ? 'entry-meta__value--absent' : '',
].filter(Boolean).join(' ');

const EntryMetaPanel = (props: EntryMetaPanelProps) => {
  const { rows, issues } = props;

  return (
    <Box className="entry-meta">
      <Box className="entry-meta__grid">
        {rows.map((row) => (
          <Box key={row.key} className="entry-meta__row">
            <Text as="span" className="entry-meta__label">{row.label}</Text>
            <Text as="span" className={cellClass(row)}>{row.value}</Text>
          </Box>
        ))}
      </Box>

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
