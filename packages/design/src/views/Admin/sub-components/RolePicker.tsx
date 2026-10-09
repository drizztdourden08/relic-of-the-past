/* @layer site-kit @kind component */
import { useCallback, useMemo } from 'react';
import { Select } from '@drizztdourden08/tessera/primitives';
import type { SelectOption } from '@drizztdourden08/tessera/primitives';
import { RoleName } from '../../../compounds/RoleName/RoleName';
import { NO_ROLE } from './RolePicker.constants';
import type { RolePickerProps } from './RolePicker.type';

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
