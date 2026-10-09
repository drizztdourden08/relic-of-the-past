/* @layer renderer-widgets @kind component */
import { useState } from 'react';
import { Box, Select, Text, Textarea } from '@drizztdourden08/tessera/primitives';
import { RECORD_WRITERS } from '@app/ui/domains/app/views/DataInspector/behavior/record-writers';
import type { ReviewMark, ReviewStatus } from '@rotp/game-data';
import type { InspectorRow } from '@app/ui/domains/app/views/DataInspector/DataInspector.type';
import { reviewStamp } from '../behavior/review-stamp';
import { REVIEW_STATUS_OPTIONS, REVIEW_TITLE, REVIEW_UNTOUCHED } from '../LiveDataInspector.constants';
import type { ReviewControlsProps } from '../LiveDataInspector.type';
import './ReviewControls.css';

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
    status: mark?.status ?? REVIEW_UNTOUCHED,
    ...(note.trim() ? { note: note.trim() } : {}),
    ...fields,
    source: 'person',
    at: new Date().toISOString(),
  });

  return (
    <Box className="live-review">
      <Text as="span" className="live-review__label">{REVIEW_TITLE}</Text>
      <Box className="live-review__meta">
        <Text as="span" className="live-review__id" title={recordId}>{recordId}</Text>
        <Text className="live-review__stamp">{`Reviewed ${reviewStamp(mark)}`}</Text>
      </Box>
      <Select
        value={mark?.status ?? REVIEW_UNTOUCHED}
        onChange={(value) => void write(marked({ status: value as ReviewStatus }))}
        options={REVIEW_STATUS_OPTIONS}
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
