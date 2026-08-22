/* @layer renderer-components @kind component */
/**
 * The read-only stand-in for a dialogue entry a translator must never edit —
 * a choice-prompt cursor frame or the extraction pipeline's padding string
 * (see `structuralEntry` in `shared/game/language/codes/structural-entries.ts`).
 *
 * Dashed border and dimmed text mark it inert at a glance, same family as the
 * other "engine scaffolding, not prose" treatment already used for a row
 * break token in this editor. The reason is stated calmly, as a fact about
 * what the entry is for, not a warning about what will go wrong.
 *
 * Presentational only: id and reason in, an optional unlock request out. No
 * confirmation UI here — a caller that wires `onUnlock` owns that dialog.
 */
import { Box, Text, Badge, Button } from '@ds/primitives';
import './LockedEntryCard.css';

type LockedEntryCardProps = {
  id: number;
  /** Why it is locked, from structuralEntry(id).reason. */
  reason: string;
  onUnlock?: () => void;
};

const LockedEntryCard = (props: LockedEntryCardProps) => {
  const { id, reason, onUnlock } = props;

  return (
    <Box className="locked-entry-card">
      <Box className="locked-entry-card__head">
        <Text as="span" variant="caption" className="locked-entry-card__id">
          {`#${String(id).padStart(3, '0')}`}
        </Text>
        <Badge variant="neutral" className="locked-entry-card__tag">engine scaffolding</Badge>
        <Badge variant="neutral" className="locked-entry-card__lock">locked</Badge>
      </Box>
      <Text as="p" variant="body" className="locked-entry-card__reason">{reason}</Text>
      {onUnlock ? (
        <Button variant="tertiary" size="sm" className="locked-entry-card__unlock" onClick={onUnlock}>
          Unlock…
        </Button>
      ) : null}
    </Box>
  );
};

export { LockedEntryCard };
export type { LockedEntryCardProps };
