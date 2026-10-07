/* @layer sanctuary-site @kind component */
/**
 * The Sanctuary's section of the group editor: the file types a group sees and uploads to,
 * and the reports switch. It edits the group's Sanctuary permission list.
 */
import { FILE_TYPES, FILE_TYPE_SHELF_LABELS } from '@shared/sanctuary/file-types';
import type { FileType } from '@shared/sanctuary/file-types';
import { REPORTS_PERMISSION, SANCTUARY_RIGHTS, filePermission } from '@shared/sanctuary/sanctuary-rights';
import { Checkbox } from '@ds/primitives/Checkbox';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { Toggle } from '@ds/primitives/Toggle';
import type { RightsEditorProps } from '@site-kit/site/site-definition.type';

/** The list with one permission set on or off, in the model's order. */
const withPermission = (value: readonly string[], permission: string, on: boolean): string[] =>
  SANCTUARY_RIGHTS.all.filter((entry) => (entry === permission ? on : value.includes(entry)));

const SanctuaryRightsEditor = (props: RightsEditorProps) => {
  const { value, onChange } = props;
  const toggleType = (type: FileType, on: boolean) => onChange(withPermission(value, filePermission(type), on));
  return (
    <>
      <Field label="File types">
        <Flex gap="md" wrap>
          {FILE_TYPES.map((type) => (
            <Checkbox
              key={type}
              label={FILE_TYPE_SHELF_LABELS[type]}
              checked={value.includes(filePermission(type))}
              onChange={(on) => toggleType(type, on)}
            />
          ))}
        </Flex>
      </Field>
      <Toggle
        label="Reports"
        description="The Reports page and its search results."
        checked={value.includes(REPORTS_PERMISSION)}
        onChange={(on) => onChange(withPermission(value, REPORTS_PERMISSION, on))}
      />
    </>
  );
};

export { SanctuaryRightsEditor };
