/* @layer renderer-components @kind component */
/**
 * The node's id, and nothing else it can help.
 *
 * IT WAS THREE FIELDS AND A PARAGRAPH. `kind` repeated what the inspector's own
 * header already says two rows above it; "where it sits" showed a one-word path
 * for the roots most people select; and a standing note explained that ids must
 * be unique - a rule the reader has to hold in their head against a field that
 * said nothing when they broke it. Prose that describes a validation is a sign
 * the validation is not being shown.
 *
 * SO THE RULE IS ENFORCED WHERE IT IS BROKEN. The field takes a draft, checks it
 * on every keystroke, and names the exact problem under itself. It commits only
 * a valid id - on blur or Enter - because renaming a node to a duplicate the
 * moment the character is typed would put two of the same id in the document on
 * the way to a name that was going to be fine.
 *
 * The breadcrumb survives only when it has something to say: a node deep inside
 * a switch or a repeat, where the branch is not obvious.
 */
import { useEffect, useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { Text } from '@ds/primitives/Text';
import { TextInput } from '@ds/primitives/TextInput';
import type { HudNode } from '@shared/types/hud';
import type { KeyboardEvent } from 'react';

interface IdentitySectionProps {
  node: HudNode;
  breadcrumb: readonly string[];
  /** Every OTHER node's id in the document - what a duplicate is measured against. */
  otherIds: readonly string[];
  onPatch: (patch: Partial<HudNode>) => void;
}

/** The two rules the document validator itself enforces (`validate-box.ts`'s
 *  "every node needs a non-empty id" and `validate-node.ts`'s "used more than
 *  once"), said here in the second person and before the save instead of after. */
const errorFor = (draft: string, otherIds: readonly string[]): string | null => {
  const id = draft.trim();
  if (!id) return 'An id cannot be empty.';
  if (otherIds.includes(id)) return `Another node already uses "${id}".`;
  return null;
};

const IdentitySection = (props: IdentitySectionProps) => {
  const { node, breadcrumb, otherIds, onPatch } = props;
  const [draft, setDraft] = useState(node.id);

  // Selecting a different node has to reset the draft; without this the field
  // would keep showing the id of whatever was selected before it.
  useEffect(() => { setDraft(node.id); }, [node.id]);

  const error = errorFor(draft, otherIds);

  const commit = (): void => {
    const id = draft.trim();
    if (error || id === node.id) { setDraft(node.id); return; }
    onPatch({ id });
  };

  // `preventDefault` on Escape is how an inner editor tells the dismiss stack
  // the key was consumed here. Without it the abandoned rename would also close
  // the editor, which is what used to happen.
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') commit();
    if (event.key === 'Escape') { event.preventDefault(); setDraft(node.id); }
  };

  return (
    <Box className="hud-inspect__group">
      <Field size="sm" label="id" error={error}>
        <TextInput
          size="sm"
          aria-label="Node id"
          aria-invalid={error ? true : undefined}
          className={error ? 'hud-inspect__id-field is-invalid' : 'hud-inspect__id-field'}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={onKeyDown}
        />
      </Field>
      {breadcrumb.length > 1 && (
        <Text className="hud-inspect__breadcrumb">{breadcrumb.join(' › ')}</Text>
      )}
    </Box>
  );
};

export { IdentitySection };
export type { IdentitySectionProps };
