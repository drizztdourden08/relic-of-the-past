/* @layer site-kit @kind component */
import { Field, Stack, Text, TextInput } from '@drizztdourden08/tessera/primitives';
import { FormActions } from '../../../compounds/FormActions/FormActions';
import { useGroupDraft } from '../behavior/useGroupDraft';
import { GroupRightsFields } from './GroupRightsFields';
import { GroupRoleField } from './GroupRoleField';
import { GROUP_NAME_MAX_CHARS } from './GroupEditor.constants';
import type { GroupEditorProps } from './GroupEditor.type';

const GroupEditor = (props: GroupEditorProps) => {
  const { group, busy, onSave, onCancel, roles, rolesAvailable, rightsEditors } = props;
  const draft = useGroupDraft(group, rightsEditors);
  const { name, setName, roleId, setRoleId, rights, setRights, parsed, problem } = draft;

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
      <GroupRoleField roles={roles} rolesAvailable={rolesAvailable} roleId={roleId} onChange={setRoleId} />
      <GroupRightsFields
        rightsEditors={rightsEditors}
        rights={rights}
        onChange={(site, next) => setRights((current) => ({ ...current, [site]: next }))}
      />
      {name.trim() && problem && <Text as="p" variant="caption" role="alert">{problem}</Text>}
      <FormActions busy={busy} canSave={parsed.success} onCancel={onCancel} />
    </Stack>
  );
};

export { GroupEditor };
