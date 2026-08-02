/* @layer renderer-components @kind component */
/**
 * The chip row a closed set is EDITED with — the same visual language the
 * hand-built forms use for their tags, reached from a schema instead of from a
 * hand-written group list.
 *
 * A derived enum has no namespaces to group by, so this always builds exactly
 * one unlabelled group: the row above already names the field, and a heading
 * repeating it would be noise. `single` is what makes the same control serve a
 * one-of field and a list of literals without a second component.
 */
import { TagPicker } from '../../../primitives/TagPicker';
import type { TagPickerGroup } from '../../../primitives/TagPicker';

interface EnumTagSelectProps {
  /** Group identity — the field path, so two sets on one form stay distinct. */
  id: string;
  options: readonly string[];
  selected: readonly string[];
  onChange: (selected: readonly string[]) => void;
  /** One pick at a time, for a field that holds a value rather than a set. */
  single?: boolean;
  disabled?: boolean;
}

const EnumTagSelect = (props: EnumTagSelectProps) => {
  const { id, options, selected, onChange, single = false, disabled = false } = props;
  const groups: TagPickerGroup[] = [
    { id, options: options.map((option) => ({ value: option, label: option })) },
  ];
  return (
    <TagPicker
      groups={groups}
      value={[...selected]}
      single={single}
      disabled={disabled}
      onChange={(next) => onChange(next)}
    />
  );
};

export { EnumTagSelect };
export type { EnumTagSelectProps };
