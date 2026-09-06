/* @layer renderer-components @kind component */
/**
 * The searchable picker an id reference gets once someone has told the kit what
 * the target collection holds.
 *
 * Two things it refuses to do silently. A value that is in no option would
 * otherwise vanish behind the placeholder and read as "empty", so it is added
 * back as an option of its own, because a reference that points at nothing is a
 * fact about the record, not something to hide. And the option list is only ever
 * read, never rebuilt here: the caller owns it, so an 800-row collection costs
 * one mapping there instead of one per keystroke in the search box.
 */
import { useMemo } from 'react';
import { Select } from '../../../primitives/Select';
import type { IdRefOption } from '../registry';
import type { SelectOption } from '../../../primitives/Select';

interface IdRefSelectProps {
  options: readonly IdRefOption[];
  value: string;
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

const DANGLING = 'not in this collection';

const withCurrent = (options: readonly IdRefOption[], value: string): SelectOption[] => {
  const listed = options.map((option) => ({
    value: option.value,
    label: option.label,
    description: option.description,
  }));
  if (!value || listed.some((option) => option.value === value)) return listed;
  return [{ value, label: value, description: DANGLING }, ...listed];
};

const IdRefSelect = (props: IdRefSelectProps) => {
  const { options, value, placeholder, disabled = false, onChange } = props;
  const selectOptions = useMemo(() => withCurrent(options, value), [options, value]);
  return (
    <Select
      options={selectOptions}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      searchable
      onChange={onChange}
    />
  );
};

export { IdRefSelect };
export type { IdRefSelectProps };
