/* @layer renderer-components @kind component */
/**
 * The metadata for one open entry: a label/value list, with the validation
 * problems underneath.
 *
 * It sits above the three views, not inside any of them, because it is
 * true of the entry however the entry is being shown. Reading, editing and
 * previewing all want to know who says the line.
 *
 * Every value comes in already worded (`entry-meta.model.ts`); this is layout
 * and nothing else. A value stating an ABSENCE is styled as one, so "not
 * recorded" cannot be mistaken for a fact.
 */
import { Badge, Box, Text } from '@ds/primitives';
import type { MetaRow } from './entry-meta.model';
import './EntryMetaPanel.css';

type EntryMetaPanelProps = {
  rows: MetaRow[];
  /** Already-worded validation problems; empty when the entry is clean. */
  issues: string[];
  /** Measured rows, one fit bar each. Empty while the font is still loading. */
};

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
            <Badge key={issue} variant="danger">{issue}</Badge>
          ))}
        </Box>
      ) : null}

    </Box>
  );
};

export { EntryMetaPanel };
export type { EntryMetaPanelProps };
