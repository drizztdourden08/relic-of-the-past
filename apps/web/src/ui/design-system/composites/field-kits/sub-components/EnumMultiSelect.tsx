/* @layer renderer-components @kind component */
/**
 * The multi-checkbox dropdown a closed set filters with: a trigger that reads
 * back the current picks, and a checklist that stays open while you tick
 * several. Built on DropdownMenu, whose items already carry a `checked` mark,
 * rather than on the inline tag primitives — a filter row is one line tall and
 * cannot afford to grow a wrapping tag cloud.
 */
import { Button } from '../../../primitives/Button';
import { DropdownMenu } from '../../DropdownMenu';
import { useMenuOpen } from '../behavior/use-menu-open';
import type { MenuEntry } from '../../DropdownMenu';
import '../field-kits.css';

interface EnumMultiSelectProps {
  options: readonly string[];
  selected: readonly string[];
  placeholder: string;
  /** Display text per option; an option with no entry shows its own literal. */
  labels?: Readonly<Record<string, string>>;
  onChange: (selected: readonly string[]) => void;
}

const SUMMARY_MAX = 2;

const summarize = (
  selected: readonly string[],
  placeholder: string,
  labelFor: (option: string) => string,
): string => {
  if (!selected.length) return placeholder;
  if (selected.length <= SUMMARY_MAX) return selected.map(labelFor).join(', ');
  return `${selected.length} selected`;
};

const EnumMultiSelect = (props: EnumMultiSelectProps) => {
  const { options, selected, placeholder, labels, onChange } = props;
  const menu = useMenuOpen<HTMLButtonElement>();
  const labelFor = (option: string): string => labels?.[option] ?? option;

  const toggle = (option: string): void => {
    onChange(selected.includes(option)
      ? selected.filter((entry) => entry !== option)
      : [...selected, option]);
  };

  const items: MenuEntry[] = options.map((option) => ({
    key: option,
    label: labelFor(option),
    checked: selected.includes(option),
    onClick: () => toggle(option),
  }));

  return (
    <>
      <Button
        ref={menu.anchorRef}
        variant="tertiary"
        size="sm"
        className="field-kit__multi-trigger"
        aria-haspopup="menu"
        aria-expanded={menu.open}
        onClick={menu.toggle}
      >
        {summarize(selected, placeholder, labelFor)}
      </Button>
      {menu.open && items.length > 0 && <DropdownMenu items={items} anchorRef={menu.anchorRef} />}
    </>
  );
};

export { EnumMultiSelect };
export type { EnumMultiSelectProps };
