import './TagPicker.css';

interface TagPickerOption<T extends string = string> {
  value: T;
  label: string;
}

interface TagPickerGroup<T extends string = string> {
  id: string;
  label: string;
  options: TagPickerOption<T>[];
}

interface TagPickerProps<T extends string = string> {
  /** Active tag values */
  value: T[];
  /** Groups of tags to display, each with its own label */
  groups: TagPickerGroup<T>[];
  /** Called with the new full array when any tag is toggled */
  onChange: (value: T[]) => void;
  /** Overall label above all groups */
  label?: string;
  disabled?: boolean;
}

const TagPicker = <T extends string = string>(props: TagPickerProps<T>) => {
  const { value, groups, onChange, label, disabled = false } = props;

  const toggle = (tag: T) => {
    if (value.includes(tag)) {
      onChange(value.filter(v => v !== tag));
    } else {
      onChange([...value, tag]);
    }
  };

  return (
    <div className={`tag-picker ${disabled ? 'tag-picker--disabled' : ''}`}>
      {label && <span className="tag-picker__label">{label}</span>}
      {groups.map(group => (
        <div key={group.id} className="tag-picker__group">
          <span className="tag-picker__group-label">{group.label}</span>
          <div className="tag-picker__tags">
            {group.options.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`tag-picker__tag ${value.includes(opt.value) ? 'tag-picker__tag--active' : ''}`}
                onClick={() => toggle(opt.value)}
                disabled={disabled}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export { TagPicker };
export type { TagPickerGroup, TagPickerOption, TagPickerProps };
