/* @layer sanctuary-site @kind component */
/**
 * Picks the Discord role a group follows, by name, in the role's colour. The first entry
 * unlinks the group. A linked role the server no longer has stays listed, marked, so an
 * edit never drops it without the admin choosing to.
 */
import { useCallback, useMemo } from 'react';
import type { DiscordRole } from '@shared/sanctuary/group-types';
import { Select } from '@ds/primitives/Select';
import type { SelectOption } from '@ds/primitives/Select';
import { RoleName } from '../../../components/RoleName/RoleName';

type RolePickerProps = {
  roles: readonly DiscordRole[];
  /** '' for no role. */
  value: string;
  onChange: (roleId: string) => void;
};

const NO_ROLE: SelectOption = { value: '', label: 'No Discord role' };

const RolePicker = (props: RolePickerProps) => {
  const { roles, value, onChange } = props;
  const byId = useMemo(() => new Map(roles.map((role) => [role.id, role])), [roles]);

  const options = useMemo<SelectOption[]>(() => {
    const listed = roles.map((role) => ({ value: role.id, label: role.name }));
    const missing = value && !byId.has(value) ? [{ value, label: `Role no longer on the server (${value})` }] : [];
    return [NO_ROLE, ...missing, ...listed];
  }, [roles, byId, value]);

  const renderOption = useCallback((option: SelectOption) => {
    const role = byId.get(option.value);
    return role ? <RoleName name={role.name} color={role.color} /> : option.label;
  }, [byId]);

  return <Select value={value} onChange={onChange} options={options} searchable renderOption={renderOption} />;
};

export { RolePicker };
export type { RolePickerProps };
