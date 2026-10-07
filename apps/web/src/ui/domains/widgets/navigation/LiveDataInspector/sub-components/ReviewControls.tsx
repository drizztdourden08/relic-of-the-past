/* @layer renderer-widgets @kind component */
/**
 * Review controls for the record currently shown below the collection tabs.
 * A static section heading leads, matching the heading treatment the card's own
 * field groups carry, so this block reads as the card's last section and not as
 * a stray label. Under it sit the record id and the date of the last look: a
 * reviewer needs to know WHAT this is and WHEN it was last touched before
 * reading a status pill, but neither is the heading, so both are styled as the
 * subordinate metadata they are.
 *
 * The mark goes INTO the record's own file, through the same record writers an
 * edit uses, so it travels with the data. The status lands on its own; the note
 * lands on blur, because every write rewrites a source file.
 */
import { useState } from 'react';
import { Box, Select, Text, Textarea } from '@ds/primitives';
import { enumerationFor } from '@shared/game/data';
import { RECORD_WRITERS } from '@app/ui/domains/app/views/DataInspector/behavior/record-writers';
import type { EntityKind, ReviewMark, ReviewStatus } from '@shared/game/data';
import type { InspectorRow } from '@app/ui/domains/app/views/DataInspector/DataInspector.type';
import './ReviewControls.css';

const TITLE = 'Review';
const NEVER = 'never';
const UNTOUCHED: ReviewStatus = 'untouched';

const STATUS_OPTIONS = enumerationFor('review-status').map(entry => ({ value: entry.value, label: entry.label }));

/** A record the control can read a mark off and hand back with a new one. */
type Reviewable = { review?: ReviewMark };

interface ReviewControlsProps {
  kind: EntityKind;
  recordId: string;
  record: Reviewable;
}

const stamp = (mark: ReviewMark | undefined): string =>
  (mark === undefined ? NEVER : new Date(mark.at).toLocaleDateString());

const ReviewControls = (props: ReviewControlsProps) => {
  const { kind, recordId, record } = props;
  const mark = record.review;
  const [note, setNote] = useState(mark?.note ?? '');
  const [error, setError] = useState<string | null>(null);

  const write = async (next: ReviewMark): Promise<void> => {
    const writer = RECORD_WRITERS[kind];
    if (!writer) {
      setError('This collection has no write path.');
      return;
    }
    setError(null);
    try {
      await writer({ ...record, id: recordId, review: next } as unknown as InspectorRow);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'The mark could not be written.');
    }
  };

  const marked = (fields: Partial<ReviewMark>): ReviewMark => ({
    status: mark?.status ?? UNTOUCHED,
    ...(note.trim() ? { note: note.trim() } : {}),
    ...fields,
    source: 'person',
    at: new Date().toISOString(),
  });

  return (
    <Box className="live-review">
      <Text as="span" className="live-review__label">{TITLE}</Text>
      <Box className="live-review__meta">
        <Text as="span" className="live-review__id" title={recordId}>{recordId}</Text>
        <Text className="live-review__stamp">{`Reviewed ${stamp(mark)}`}</Text>
      </Box>
      <Select
        value={mark?.status ?? UNTOUCHED}
        onChange={(value) => void write(marked({ status: value as ReviewStatus }))}
        options={STATUS_OPTIONS}
        size="sm"
      />
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => {
          if ((mark?.note ?? '') !== note.trim()) void write(marked({}));
        }}
        placeholder="Note..."
        rows={2}
      />
      {error !== null && <Text className="live-review__stamp">{error}</Text>}
    </Box>
  );
};

export { ReviewControls };
export type { ReviewControlsProps };
