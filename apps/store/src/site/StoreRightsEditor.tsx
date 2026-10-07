/* @layer store-site @kind component */
/**
 * The store's section of the group editor: one checkbox per store permission, labelled
 * from the store's rights model. It edits the group's store permission list, in the
 * model's order. The Sanctuary's admin page shows it too, where groups are managed.
 */
import { STORE_RIGHTS } from '@shared/store/store-rights';
import { Checkbox } from '@ds/primitives/Checkbox';
import { Stack } from '@ds/primitives/Stack';
import type { RightsEditorProps } from '@site-kit/site/site-definition.type';

/** The list with one permission set on or off, in the model's order. */
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
