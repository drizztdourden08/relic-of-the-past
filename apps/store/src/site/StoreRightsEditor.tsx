/* @layer store-site @kind component */
import { STORE_RIGHTS } from '@shared/store/store-rights';
import { Checkbox, Stack } from '@drizztdourden08/tessera/primitives';
import type { RightsEditorProps } from '@site-kit/site/site-definition.type';

const withPermission = (value: readonly string[], permission: string, on: boolean): string[] =>
  STORE_RIGHTS.all.filter((entry) => (entry === permission ? on : value.includes(entry)));

const StoreRightsEditor = (props: RightsEditorProps) => {
  const { value, onChange } = props;
  return (
    <Stack gap="xs" align="start">
      {STORE_RIGHTS.all.map((permission) => (
        <Checkbox
          key={permission}
          label={STORE_RIGHTS.labels[permission]}
          checked={value.includes(permission)}
          onChange={(on) => onChange(withPermission(value, permission, on))}
        />
      ))}
    </Stack>
  );
};

export { StoreRightsEditor };
