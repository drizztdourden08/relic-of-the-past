/* @layer renderer-components @kind component */
import { useEffect, useState } from 'react';
import { Box, Field, Text, TextInput } from '@drizztdourden08/tessera/primitives';
import type { KeyboardEvent } from 'react';
import type { IdentitySectionProps } from './IdentitySection.type';

const errorFor = (draft: string, otherIds: readonly string[]): string | null => {
  const id = draft.trim();
  if (!id) return 'An id cannot be empty.';
  if (otherIds.includes(id)) return `Another node already uses "${id}".`;
  return null;
};

const IdentitySection = (props: IdentitySectionProps) => {
  const { node, breadcrumb, otherIds, onPatch } = props;
  const [draft, setDraft] = useState(node.id);

  useEffect(() => { setDraft(node.id); }, [node.id]);

  const error = errorFor(draft, otherIds);

  const commit = (): void => {
    const id = draft.trim();
    if (error || id === node.id) { setDraft(node.id); return; }
    onPatch({ id });
  };

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
export type { IdentitySectionProps } from './IdentitySection.type';
