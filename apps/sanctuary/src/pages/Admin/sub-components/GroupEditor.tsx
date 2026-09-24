/* @layer sanctuary-site @kind component */
/**
 * The form for one group: its name, the Discord role that fills it, the file types it
 * sees and the reports switch. The body is checked against the shared schema, so what
 * Save sends is what the API accepts.
 */
import { useState } from 'react';
import { FILE_TYPES } from '@shared/sanctuary/file-types';
import type { FileType } from '@shared/sanctuary/file-types';
import type { Group } from '@shared/sanctuary/group-types';
import { createGroupSchema } from '@shared/sanctuary/schemas/group-schemas';
import type { CreateGroupBody } from '@shared/sanctuary/schemas/group-schemas';
import { Button } from '@ds/primitives/Button';
import { Checkbox } from '@ds/primitives/Checkbox';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { TextInput } from '@ds/primitives/TextInput';
import { Toggle } from '@ds/primitives/Toggle';
import { SCOPE_TYPE_LABELS } from '../../Files/Files.constants';

type GroupEditorProps = {
  /** The group being edited, or null for a new one. */
  group: Group | null;
  busy: boolean;
  onSave: (body: CreateGroupBody) => void;
  onCancel: () => void;
};

const ROLE_HINT = 'Right-click the role in Discord, Copy Role ID';
/** The shared schema's cap on a group name. */
const NAME_MAX_CHARS = 40;

const toggled = (types: readonly FileType[], type: FileType, on: boolean): FileType[] =>
  FILE_TYPES.filter((t) => (t === type ? on : types.includes(t)));

const GroupEditor = (props: GroupEditorProps) => {
  const { group, busy, onSave, onCancel } = props;
  const [name, setName] = useState(group?.name ?? '');
  const [roleId, setRoleId] = useState(group?.discordRoleId ?? '');
  const [types, setTypes] = useState<FileType[]>(group?.rights.fileTypes ?? []);
  const [reports, setReports] = useState(group?.rights.reports ?? false);

  const parsed = createGroupSchema.safeParse({
    name,
    discordRoleId: roleId.trim() || null,
    rights: { fileTypes: types, reports },
  });
  const problem = parsed.success ? null : parsed.error.issues[0]?.message ?? 'Check the fields.';

  return (
    <Stack
      as="form"
      gap="sm"
      align="stretch"
      className="group-editor"
      onSubmit={(event) => { event.preventDefault(); if (parsed.success) onSave(parsed.data); }}
    >
      <Text as="span" variant="caption" className="group-editor__title">
        {group ? `editing · ${group.name}` : 'new group'}
      </Text>
      <Field label="Name">
        <TextInput value={name} maxLength={NAME_MAX_CHARS} onChange={(event) => setName(event.target.value)} placeholder="Artists" />
      </Field>
      <Field label="Discord role id" hint={ROLE_HINT}>
        <TextInput value={roleId} inputMode="numeric" onChange={(event) => setRoleId(event.target.value)} placeholder="no Discord role" />
      </Field>
      <Field label="File types">
        <Flex gap="md" wrap>
          {FILE_TYPES.map((type) => (
            <Checkbox
              key={type}
              label={SCOPE_TYPE_LABELS[type]}
              checked={types.includes(type)}
              onChange={(on) => setTypes((current) => toggled(current, type, on))}
            />
          ))}
        </Flex>
      </Field>
      <Toggle label="Reports" description="The Reports page and its search results." checked={reports} onChange={setReports} />
      {name.trim() && problem && <Text as="p" variant="caption" role="alert">{problem}</Text>}
      <Flex gap="sm">
        <Button type="submit" variant="primary" size="sm" disabled={busy || !parsed.success}>Save</Button>
        <Button type="button" variant="tertiary" size="sm" disabled={busy} onClick={onCancel}>Cancel</Button>
      </Flex>
    </Stack>
  );
};

export { GroupEditor };
export type { GroupEditorProps };
