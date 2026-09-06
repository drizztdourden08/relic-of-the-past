/* @layer renderer-components @kind component */
/**
 * One entry at rest: a single dense row.
 *
 * A set is a few hundred entries, so the list's job is FINDING one, not reading
 * all of them. Everything on the row narrows a search: the index, who says it,
 * what opens it, where, how much of it there is, whether it fits, and where a
 * prompt's options lead. The words themselves come last, taking whatever room
 * is left.
 *
 * EVERY CELL IS ALWAYS DRAWN, empty when it has nothing to say. The row is a grid
 * and the columns are the whole point of it: a cell dropped for being empty pulls
 * every later cell one track to the left, and one such row is enough to make the
 * column below it unreadable.
 *
 * Closed is the resting state and the WHOLE ROW is the control that opens it, so
 * there is no small target to aim at and no separate affordance to explain. That
 * is also why every child is inline: the row is one button, and a button holding
 * blocks is markup a browser is entitled to reflow.
 *
 * Nothing here is editable, so scanning a set is always safe.
 */
import { useCallback } from 'react';
import { Badge, Button, Text } from '@ds/primitives';
import type { RowFit } from '@shared/game/language';
import { fitChipOf } from './fit-chip';
import type { EntryRowModel } from './entry-row.model';
import './EntryCardCollapsed.css';

type EntryCardCollapsedProps = {
  model: EntryRowModel;
  /** Measured rows for the fit chip; empty while the entry has no text. */
  rows: RowFit[];
  onOpen: (id: number) => void;
};

const EntryCardCollapsed = (props: EntryCardCollapsedProps) => {
  const { model, rows, onOpen } = props;
  const fit = fitChipOf(rows);

  const handleOpen = useCallback(() => onOpen(model.id), [model.id, onOpen]);

  return (
    <Button
      variant="ghost"
      className="entry-row"
      aria-expanded={false}
      title={model.choiceDetail || undefined}
      onClick={handleOpen}
    >
      <Text as="span" className="entry-row__caret" aria-hidden="true">▸</Text>
      <Text as="span" className="entry-row__id">{model.idLabel}</Text>

      <Text as="span" className={`entry-row__who${model.who ? '' : ' entry-row__who--unknown'}`}>
        {model.who || 'source not recorded'}
      </Text>

      <Text as="span" className="entry-row__slot">
        {model.trigger ? (
          <Badge className="entry-row__trigger" variant="neutral">{model.trigger}</Badge>
        ) : null}
      </Text>

      <Text as="span" className="entry-row__size">{model.size}</Text>
      <Text as="span" className="entry-row__choice">{model.choice}</Text>

      <Text as="span" className="entry-row__excerpt">{model.excerpt}</Text>

      <Text as="span" className="entry-row__slot">
        {model.issues.map((issue) => (
          <Badge key={issue} variant="danger" className="entry-row__issue">{issue}</Badge>
        ))}
      </Text>

      <Text as="span" className="entry-row__slot">
        {fit.label ? (
          <Badge className="entry-row__fit" variant={fit.variant} title={fit.detail}>
            {fit.label}
          </Badge>
        ) : null}
      </Text>
    </Button>
  );
};

export { EntryCardCollapsed };
export type { EntryCardCollapsedProps };
