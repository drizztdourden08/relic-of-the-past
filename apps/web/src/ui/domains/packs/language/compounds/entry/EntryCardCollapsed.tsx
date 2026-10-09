/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Status, Button, Text } from '@drizztdourden08/tessera/primitives';
import { fitChipOf } from './fit-chip';
import type { EntryCardCollapsedProps } from './entry.type';
import './EntryCardCollapsed.css';

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
          <Status className="entry-row__trigger" tone="neutral">{model.trigger}</Status>
        ) : null}
      </Text>

      <Text as="span" className="entry-row__size">{model.size}</Text>
      <Text as="span" className="entry-row__choice">{model.choice}</Text>

      <Text as="span" className="entry-row__excerpt">{model.excerpt}</Text>

      <Text as="span" className="entry-row__slot">
        {model.issues.map((issue) => (
          <Status key={issue} tone="danger" className="entry-row__issue">{issue}</Status>
        ))}
      </Text>

      <Text as="span" className="entry-row__slot">
        {fit.label ? (
          <Status className="entry-row__fit" tone={fit.variant} title={fit.detail}>
            {fit.label}
          </Status>
        ) : null}
      </Text>
    </Button>
  );
};

export { EntryCardCollapsed };
