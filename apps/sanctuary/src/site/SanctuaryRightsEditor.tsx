/* @layer sanctuary-site @kind component */
import { FILE_TYPES, FILE_TYPE_SHELF_LABELS } from '@rotp/hub-contracts';
import type { FileType } from '@rotp/hub-contracts';
import { REPORTS_PERMISSION, SANCTUARY_RIGHTS, filePermission } from '@rotp/hub-contracts';
import { Checkbox, Field, Flex, Toggle } from '@drizztdourden08/tessera/primitives';
import type { RightsEditorProps } from '@site-kit/site/site-definition.type';

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
