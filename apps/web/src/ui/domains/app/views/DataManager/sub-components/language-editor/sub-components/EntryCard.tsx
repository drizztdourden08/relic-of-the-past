/* @layer renderer-components @kind component */
/**
 * One dialogue entry at rest: the line in the game's own face, with just
 * enough around it to tell it apart from the hundreds either side — its index,
 * what opens it, where a prompt's options lead, how well it fits, and what it
 * inserts at runtime.
 *
 * This is the state a translator scans, so nothing here is editable: the card
 * carries a single Edit button and hands the id back.
 */
import { useCallback, useMemo } from 'react';
import { Badge, Box, Button, Card, Text } from '@ds/primitives';
import { contextFor } from '@shared/game/data/dialogue-context';
import type { DialogueChoice, DialogueTrigger } from '@shared/game/data/dialogue-context';
import type {
  EntryIssue, GlyphMetrics, GlyphSheet, RowFit, ScreenFit, Token,
} from '@shared/game/language';
import { FitMeter } from './FitMeter';
import { EntryText } from './EntryText';
import { summarizeEntry } from './entry-summary';
import './EntryCard.css';

type EntryCardProps = {
  id: number;
  tokens: Token[];
  screens: ScreenFit[];
  /** The set's alphabet and glyph tiles; null while its font is being read. */
  metrics: GlyphMetrics | null;
  sheet: GlyphSheet | null;
  issues?: EntryIssue[];
  /** Disabled when another entry is open with unsaved changes. */
  editDisabled?: boolean;
  onEdit: (id: number) => void;
};

const BUSY_HINT = 'Save or discard the entry you have open first';

/** Short, human wording for one issue — the header has no space for a sentence. */
const issueLabel = (issue: EntryIssue): string => (
  issue.kind === 'char-not-in-alphabet'
    ? `"${issue.ch}" has no glyph`
    : `missing term "${issue.key}"`
);

/** What opens this entry, in two words at most. */
const triggerLabels: Record<DialogueTrigger, string> = {
  talk: 'talk',
  sign: 'sign',
  telepathy: 'telepathy',
  'item-get': 'item get',
  menu: 'menu',
  cutscene: 'cutscene',
  system: 'system',
  'choice-cursor': 'cursor overlay',
  unknown: '',
};

/** `choice -> #146 / #147`, or just the option count when no branch is known. */
const choiceHint = (choice: DialogueChoice): string => {
  const targets = [...new Set(choice.outcomes.map((o) => o.entry))];
  return targets.length
    ? `choice → ${targets.map((entry) => `#${entry}`).join(' / ')}`
    : `choice (${choice.options} options)`;
};

/** The full branch list, for the hover title the compact hint can't carry. */
const choiceDetail = (choice: DialogueChoice): string => (
  choice.outcomes
    .map((o) => `option ${o.option} → #${o.entry}${o.when ? ` (${o.when})` : ''}`)
    .join('\n')
);

const EntryCard = (props: EntryCardProps) => {
  const { id, tokens, screens, metrics, sheet, issues, editDisabled, onEdit } = props;

  const handleEdit = useCallback(() => onEdit(id), [id, onEdit]);

  const context = useMemo(() => contextFor(id), [id]);
  const trigger = context ? triggerLabels[context.trigger] : '';
  const rows = useMemo<RowFit[]>(() => screens.flatMap((screen) => screen.rows), [screens]);
  const contains = useMemo(() => summarizeEntry(tokens), [tokens]);
  return (
    <Card className="entry-card">
      <Box className="entry-card__head">
        <Text className="entry-card__id" variant="caption">{`#${String(id).padStart(3, '0')}`}</Text>
        {trigger ? (
          <Badge className="entry-card__trigger" variant="neutral" title={context?.source}>
            {trigger}
          </Badge>
        ) : null}
        {context?.choice ? (
          <Text className="entry-card__choice" variant="caption" title={choiceDetail(context.choice)}>
            {choiceHint(context.choice)}
          </Text>
        ) : null}
        {issues?.map((issue) => (
          <Badge key={`${issue.kind}-${'ch' in issue ? issue.ch : issue.key}`} variant="danger">
            {issueLabel(issue)}
          </Badge>
        ))}
        <Box className="entry-card__actions">
          <FitMeter rows={rows} compact />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleEdit}
            disabled={editDisabled}
            title={editDisabled ? BUSY_HINT : undefined}
          >
            Edit
          </Button>
        </Box>
      </Box>

      <EntryText tokens={tokens} metrics={metrics} sheet={sheet} />

      {contains.length > 0 ? (
        <Text className="entry-card__contains" variant="caption">{`Contains ${contains.join(' · ')}`}</Text>
      ) : null}
    </Card>
  );
};

export { EntryCard };
export type { EntryCardProps };
