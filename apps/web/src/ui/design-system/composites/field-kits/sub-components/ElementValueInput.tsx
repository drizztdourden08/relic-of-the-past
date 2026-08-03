/* @layer renderer-components @kind component */
/**
 * The operand control for "this list contains ___". The list itself has no
 * control; its ELEMENT descriptor decides one, so a list of numbers gets a
 * number field and a list drawn from a closed set gets that set's options.
 * Anything richer than a scalar falls back to text, matched against the
 * element's serialized form.
 */
import { NumberInput } from '../../../primitives/NumberInput';
import { Select } from '../../../primitives/Select';
import { TextInput } from '../../../primitives/TextInput';
import { toNumber, toText } from '../coerce';
import type { FieldDescriptor } from '../../../data/schema/field-descriptor';

interface ElementValueInputProps {
  /** The array field's element descriptor; absent when inference found none. */
  element: FieldDescriptor | undefined;
  value: unknown;
  placeholder: string;
  onChange: (value: unknown) => void;
}

const ElementValueInput = (props: ElementValueInputProps) => {
  const { element, value, placeholder, onChange } = props;

  if (element?.kind === 'number') {
    const parsed = toNumber(value);
    return (
      <NumberInput
        value={Number.isFinite(parsed) ? parsed : ''}
        placeholder={placeholder}
        onChange={(entered) => onChange(Number.isNaN(entered) ? null : entered)}
      />
    );
  }

  if (element?.kind === 'enum' && element.options?.length) {
    return (
      <Select
        value={toText(value)}
        options={element.options.map((option) => ({ value: option, label: option }))}
        placeholder={placeholder}
        onChange={onChange}
      />
    );
  }

  return (
    <TextInput
      value={toText(value)}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};

export { ElementValueInput };
export type { ElementValueInputProps };
