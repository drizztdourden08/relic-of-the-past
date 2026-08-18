/* @layer renderer-widgets @kind component */
/**
 * Review controls for the record currently shown below the collection tabs.
 * A static section heading leads, matching the heading treatment the card's
 * own field groups carry, so this block reads as the card's last section
 * rather than as a stray label. Under it sit the record id and its two
 * timestamps: a reviewer needs to know WHAT this is and WHEN it was last
 * touched before reading a status pill, but neither is the heading, so both
 * are styled as the subordinate metadata they are.
 */
import { Box, Select, Text, Textarea } from '@ds/primitives';
import { enumerationFor } from '@shared/game/data';
import { useReviewStore } from '@app/ui/domains/app/views/DataInspector/behavior/use-review-store';
import type { EntityKind } from '@shared/game/data';
import type { ReviewEntry } from '@shared/game/review/types';
import './ReviewControls.css';

const TITLE = 'Review';
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
      <Text as="span" className="live-review__label">{TITLE}</Text>
      <Box className="live-review__meta">
        <Text as="span" className="live-review__id" title={recordId}>{recordId}</Text>
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
