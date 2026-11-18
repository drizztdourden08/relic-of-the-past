/* @layer renderer-widgets @kind component */
import { useState } from 'react';
import { useT, useText } from '@drizztdourden08/brock-react';
import { Box, Select, Text, Textarea } from '@drizztdourden08/tessera/primitives';
import { RECORD_WRITERS } from '@app/data-inspector/record-writers';
import type { ReviewMark, ReviewStatus } from '@rotp/game-data';
import { reviewStamp } from '../behavior/review-stamp';
import { REVIEW_STATUS_OPTIONS, REVIEW_TITLE, REVIEW_UNTOUCHED } from '../LiveDataInspector.constants';
import type { ReviewControlsProps } from '../LiveDataInspector.type';
import './ReviewControls.css';

const ReviewControls = (props: ReviewControlsProps) => {
  const { kind, recordId, record } = props;
  const t = useT();
  const text = useText();
  const mark = record.review;
  const [note, setNote] = useState(mark?.note ?? '');
  const [error, setError] = useState<string | null>(null);

  const write = async (next: ReviewMark): Promise<void> => {
    const writer = RECORD_WRITERS[kind];
    if (!writer) {
      setError(t('views-live-data-inspector:review.error.read-only'));
      return;
    }
    setError(null);
    try {
      await writer({ ...record, id: recordId, review: next });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('views-live-data-inspector:review.error.write'));
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
      <Text as="span" className="live-review__label">{text(REVIEW_TITLE)}</Text>
      <Box className="live-review__meta">
        <Text as="span" className="live-review__id" title={recordId}>{recordId}</Text>
        <Text className="live-review__stamp">{t('views-live-data-inspector:review.stamp', { date: reviewStamp(mark, text) })}</Text>
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
        placeholder={t('views-live-data-inspector:review.note')}
        rows={2}
      />
      {error !== null && <Text className="live-review__stamp">{error}</Text>}
    </Box>
  );
};

export { ReviewControls };
