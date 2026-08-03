/* @layer renderer-widgets @kind component */
/**
 * Review controls for the record currently shown below the collection tabs —
 * the id and its two timestamps lead, per the plan: a reviewer needs to know
 * WHAT this is and WHEN it was last touched before reading a status pill.
 */
import { Box, Select, Text, Textarea } from '@ds/primitives';
import { enumerationFor } from '@shared/game/data';
import { useReviewStore } from '@app/ui/domains/app/views/DataInspector/behavior/use-review-store';
import type { EntityKind } from '@shared/game/data';
import type { ReviewEntry } from '@shared/game/review/types';
import './ReviewControls.css';

const NEVER = 'never';

const stamp = (at: number | null): string => (at == null ? NEVER : new Date(at).toLocaleString());

const STATUS_OPTIONS = enumerationFor('review-status').map(entry => ({ value: entry.value, label: entry.label }));

interface ReviewControlsProps {
  kind: EntityKind;
  recordId: string;
}

const ReviewControls = (props: ReviewControlsProps) => {
  const { kind, recordId } = props;
  const { reviewFor, setReviewStatus, setReviewNote } = useReviewStore(kind);
  const entry = reviewFor(recordId);

  return (
    <Box className="live-review">
      <Box className="live-review__meta">
        <Text className="live-review__id">{recordId}</Text>
        <Text className="live-review__stamp">{`Reviewed ${stamp(entry.reviewedAt)} · Written ${stamp(entry.updatedAt)}`}</Text>
      </Box>
      <Select
        value={entry.status}
        onChange={(value) => setReviewStatus(recordId, value as ReviewEntry['status'])}
        options={STATUS_OPTIONS}
        size="sm"
      />
      <Textarea
        value={entry.note}
        onChange={(e) => setReviewNote(recordId, e.target.value)}
        placeholder="Note…"
        rows={2}
      />
    </Box>
  );
};

export { ReviewControls };
export type { ReviewControlsProps };
