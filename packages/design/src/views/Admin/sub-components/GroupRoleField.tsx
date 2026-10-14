/* @layer site-kit @kind component */
import { Field, TextInput } from '@drizztdourden08/tessera/primitives';
import { RolePicker } from './RolePicker';
import { ROLE_HINT } from './GroupEditor.constants';
import type { GroupRoleFieldProps } from './GroupRoleField.type';

const GroupRoleField = (props: GroupRoleFieldProps) => {
  const { roles, rolesAvailable, roleId, onChange } = props;

  if (rolesAvailable) {
    return (
      <Field label="Discord role">
        <RolePicker roles={roles} value={roleId} onChange={onChange} />
      </Field>
    );
  }
  return (
    <Field label="Discord role id" hint={ROLE_HINT}>
      <TextInput value={roleId} inputMode="numeric" onChange={(event) => onChange(event.target.value)} placeholder="no Discord role" />
    </Field>
  );
};

export { GroupRoleField };
