/* @layer renderer-components @kind component */
/**
 * The stand-in for a dialogue entry a translator must never edit — a
 * choice-prompt cursor frame or the extraction pipeline's padding string (see
 * `structuralEntry` in `shared/game/language/codes/structural-entries.ts`).
 *
 * It is the SAME ROW as a closed entry, on the same grid, dashed and dimmed. It
 * used to be a full card with the reason set as a paragraph, which made the two
 * loudest things in a list of four hundred rows the two rows nobody may touch.
 * Sharing the row shape puts them back in proportion; the reason is still stated
 * in full, as the row's own title.
 *
 * The reason is stated calmly, as a fact about what the entry is for, not as a
 * warning about what will go wrong.
 */
import { Badge, Box, Text } from '@ds/primitives';
import './entry/EntryCardCollapsed.css';

type LockedEntryCardProps = {
  id: number;
  /** Why it is locked, from structuralEntry(id).reason. */
  reason: string;
};

const LockedEntryCard = (props: LockedEntryCardProps) => {
  const { id, reason } = props;

  return (
    <Box className="entry-row entry-row--locked" title={reason}>
      <Text as="span" className="entry-row__caret" aria-hidden="true">·</Text>
      <Text as="span" className="entry-row__id">{`#${String(id).padStart(3, '0')}`}</Text>
      <Text as="span" className="entry-row__who entry-row__who--unknown">engine scaffolding</Text>
      <Text as="span" className="entry-row__slot">
        <Badge variant="warning" className="entry-row__trigger">locked</Badge>
      </Text>
      <Text as="span" className="entry-row__size" />
      <Text as="span" className="entry-row__choice" />
      <Text as="span" className="entry-row__excerpt">{reason}</Text>
      <Text as="span" className="entry-row__slot" />
      <Text as="span" className="entry-row__slot" />
    </Box>
  );
};

export { LockedEntryCard };
export type { LockedEntryCardProps };
