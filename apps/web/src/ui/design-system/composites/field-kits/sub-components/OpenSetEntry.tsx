/* @layer renderer-components @kind component */
/**
 * The entry a closed-set control offers for a value its option list has never
 * seen: a box and the button that applies it.
 *
 * Fully controlled, so the open state lives one level up with the toggle that
 * owns it and this stays a pure rendering of a draft. Enter applies, matching
 * the button beside it; Escape is deliberately not bound, because this renders
 * inside dialogs that close on that key and a half-typed value should not take
 * the whole form down with it.
 */
import { Button } from '../../../primitives/Button';
import { Flex } from '../../../primitives/Flex';
import { TextInput } from '../../../primitives/TextInput';

const APPLY = 'Set';
const PLACEHOLDER = 'a value not listed';

interface OpenSetEntryProps {
  draft: string;
  /** The field's label, which names the box for assistive tech. */
  label: string;
  disabled?: boolean;
  onDraft: (draft: string) => void;
  onCommit: () => void;
}

const OpenSetEntry = (props: OpenSetEntryProps) => {
  const { draft, label, disabled = false, onDraft, onCommit } = props;
  return (
    <Flex className="field-kit__open-set-entry" gap="xs" align="center">
      <TextInput
        className="field-kit__open-set-input"
        value={draft}
        placeholder={PLACEHOLDER}
        disabled={disabled}
        aria-label={`${label}: a value that is not listed`}
        onChange={(event) => onDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          onCommit();
        }}
      />
      <Button size="sm" variant="secondary" disabled={disabled} onClick={onCommit}>
        {APPLY}
      </Button>
    </Flex>
  );
};

export { OpenSetEntry };
export type { OpenSetEntryProps };
