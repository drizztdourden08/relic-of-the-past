/* @layer site-kit @kind component */
import { Fragment, useState } from 'react';
import type { GroupRights } from '@shared/hub/group-types';
import { createGroupSchema } from '@shared/hub/schemas/group-schemas';
import { Button } from '@ds/primitives/Button';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { TextInput } from '@ds/primitives/TextInput';
import type { RightsEditorSlot } from '../../../site/site-definition.type';
import { RolePicker } from './RolePicker';
import { GROUP_NAME_MAX_CHARS, ROLE_HINT } from './GroupEditor.constants';
import type { GroupEditorProps } from './GroupEditor.type';

const emptyRights = (editors: readonly RightsEditorSlot[]): GroupRights =>
  Object.fromEntries(editors.map(({ model }) => [model.site, []]));

const GroupEditor = (props: GroupEditorProps) => {
  const { group, busy, onSave, onCancel, roles, rolesAvailable, rightsEditors } = props;
  const [name, setName] = useState(group?.name ?? '');
  const [roleId, setRoleId] = useState(group?.discordRoleId ?? '');
  const [rights, setRights] = useState<GroupRights>(group?.rights ?? emptyRights(rightsEditors));
  const titled = rightsEditors.length > 1;

  const parsed = createGroupSchema.safeParse({ name, discordRoleId: roleId.trim() || null, rights });
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
        <TextInput value={name} maxLength={GROUP_NAME_MAX_CHARS} onChange={(event) => setName(event.target.value)} placeholder="Artists" />
      </Field>
      {rolesAvailable
        ? (
          <Field label="Discord role">
            <RolePicker roles={roles} value={roleId} onChange={setRoleId} />
          </Field>
        )
        : (
          <Field label="Discord role id" hint={ROLE_HINT}>
            <TextInput value={roleId} inputMode="numeric" onChange={(event) => setRoleId(event.target.value)} placeholder="no Discord role" />
          </Field>
        )}
      {rightsEditors.map(({ model, Editor }) => (
        <Fragment key={model.site}>
          {titled && <Text as="span" variant="caption" className="group-editor__title">{model.site}</Text>}
          <Editor
            value={rights[model.site] ?? []}
            onChange={(next) => setRights((current) => ({ ...current, [model.site]: next }))}
          />
        </Fragment>
      ))}
      {name.trim() && problem && <Text as="p" variant="caption" role="alert">{problem}</Text>}
      <Flex gap="sm">
        <Button type="submit" variant="primary" size="sm" disabled={busy || !parsed.success}>Save</Button>
        <Button type="button" variant="tertiary" size="sm" disabled={busy} onClick={onCancel}>Cancel</Button>
      </Flex>
    </Stack>
  );
};

export { GroupEditor };
