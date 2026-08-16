/* @layer renderer-components @kind component */
/**
 * A closed-set control, decorated so the set stays open.
 *
 * A derived option list is what has been seen, not what is permitted, so every
 * picker built from one can only re-offer the past. Where a field happens to
 * carry the same value on every record today it earns a picker with a single
 * choice, already active, and — on a field the schema says cannot be empty —
 * nothing left to do with it at all. That is a dead end produced by the data
 * rather than by the design, and it will happen again on the next field that
 * has only ever been written one way.
 *
 * So the picker keeps its options and gains one more move: an entry for a value
 * nobody has written yet. It sits beside the control rather than replacing it,
 * because choosing a known value is still the common case and stays one click,
 * and the same toggle opens and closes it so nothing depends on Escape.
 *
 * This is also the element the picker has to fit inside, so it is the one that
 * can answer whether it does. A caller that passes a narrower `fallback` gets
 * the row measured and the narrower control swapped in whenever the one it
 * prefers would push past the edge — see `behavior/use-fits-row`.
 */
import { useRef, useState } from 'react';
import { Box } from '../../../primitives/Box';
import { Button } from '../../../primitives/Button';
import { useFitsRow } from '../behavior/use-fits-row';
import { committedValue } from '../open-set';
import { OpenSetEntry } from './OpenSetEntry';
import type { ReactNode } from 'react';

const TOGGLE = '+ Other';

interface OpenSetControlProps {
  /** The value the record holds; the entry opens prefilled with it. */
  current: string;
  /** The field's label — names the entry for assistive tech. */
  label: string;
  /** Called with a trimmed, non-empty value that differs from the current one. */
  onSubmit: (value: string) => void;
  disabled?: boolean;
  /** The closed-set control being decorated. */
  children: ReactNode;
  /** Shown in place of the children where they are too wide for the row. */
  fallback?: ReactNode;
  /** The text the children show — what changes it changes how wide they are. */
  fitSignature?: string;
}

const OpenSetControl = (props: OpenSetControlProps) => {
  const { current, label, onSubmit, disabled = false, children, fallback, fitSignature = '' } = props;
  // Closed while null; a string — the empty one included — is an open entry.
  const [draft, setDraft] = useState<string | null>(null);
  const rowRef = useRef<HTMLElement>(null);
  const fits = useFitsRow({ rowRef, signature: fitSignature, enabled: fallback !== undefined });

  const commit = () => {
    const next = committedValue(draft ?? '', current);
    setDraft(null);
    if (next !== undefined) onSubmit(next);
  };

  return (
    <Box ref={rowRef} className="field-kit__open-set">
      {fits ? children : fallback}
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
    </Box>
  );
};

export { OpenSetControl };
export type { OpenSetControlProps };
