/* @layer renderer-components @kind component */
/**
 * A closed-set control, decorated so the set stays open.
 *
 * A derived option list is what has been seen, not what is permitted, so every
 * picker built from one can only re-offer the past. A field written the same way
 * on every record earns a picker with one choice, already active, and on a field
 * the schema says cannot be empty there is nothing left to do with it. That dead
 * end comes from the data, not the design.
 *
 * So the picker keeps its options and gains one more move: an entry for a value
 * nobody has written yet. It sits beside the control instead of replacing it,
 * and the same toggle opens and closes it so nothing depends on Escape.
 */
import { useState } from 'react';
import { Button } from '../../../primitives/Button';
import { Flex } from '../../../primitives/Flex';
import { committedValue } from '../open-set';
import { OpenSetEntry } from './OpenSetEntry';
import type { ReactNode } from 'react';

const TOGGLE = '+ Other';

interface OpenSetControlProps {
  /** The value the record holds; the entry opens prefilled with it. */
  current: string;
  /** The field's label, which names the entry for assistive tech. */
  label: string;
  /** Called with a trimmed, non-empty value that differs from the current one. */
  onSubmit: (value: string) => void;
  disabled?: boolean;
  /** The closed-set control being decorated. */
  children: ReactNode;
}

const OpenSetControl = (props: OpenSetControlProps) => {
  const { current, label, onSubmit, disabled = false, children } = props;
  // Closed while null. Any string, the empty one included, is an open entry.
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    const next = committedValue(draft ?? '', current);
    setDraft(null);
    if (next !== undefined) onSubmit(next);
  };

  return (
    <Flex className="field-kit__open-set" gap="xs" align="center" wrap>
      {children}
      <Button
        size="sm"
        variant="tertiary"
        disabled={disabled}
        aria-expanded={draft !== null}
        title={`${label}: use a value that is not listed`}
        onClick={() => setDraft(draft === null ? current : null)}
      >
        {TOGGLE}
      </Button>
      {draft !== null && (
        <OpenSetEntry
          draft={draft}
          label={label}
          disabled={disabled}
          onDraft={setDraft}
          onCommit={commit}
        />
      )}
    </Flex>
  );
};

export { OpenSetControl };
export type { OpenSetControlProps };
