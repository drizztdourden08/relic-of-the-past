/* @layer renderer-components @kind component */
/**
 * The operator picker for one clause, and the leading half of the merged
 * control strip the row draws. The button shows only the current operator's
 * glyph — the plan's stated reason is saving space in the button itself — and
 * the dropdown lists every operator the field's kind offers, each with its
 * glyph AND its text label, since the label only ever appears there.
 *
 * The dropdown also carries the clause's comparison modifiers (see
 * behavior/operator-menu-items). Picking an operator is exclusive, so it closes
 * the menu; toggling a modifier is not, so the menu stays open and the check
 * mark moves under the pointer.
 *
 * Case folding is the default, so only the opt-in is worth marking on the
 * button: the glyph takes an accent colour rather than growing a second
 * character, which would cost the icon-only button its width.
 */
import { Button } from '../../../primitives/Button';
import { operatorsFor } from '../../../data/filter/operators';
import { DropdownMenu } from '../../DropdownMenu';
import { operatorMenuItems, supportsCaseModifier } from '../behavior/operator-menu-items';
import { useAnchorMenu } from '../behavior/use-anchor-menu';
import { glyphForOperatorIcon } from './operator-icon-glyphs';
import type { FieldDescriptor } from '../../../data/schema/field-descriptor';
import '../FilterBar.css';

interface OperatorMenuProps {
  field: FieldDescriptor;
  op: string;
  /** Text only, and absent unless the clause turned it on. */
  caseSensitive?: boolean;
  onChange: (nextOp: string) => void;
  /** Omitted where the modifier should not be offered. */
  onChangeCaseSensitive?: (next: boolean) => void;
}

const CASE_SENSITIVE_SUFFIX = ', match case';

const OperatorMenu = (props: OperatorMenuProps) => {
  const { field, op, caseSensitive, onChange, onChangeCaseSensitive } = props;
  const menu = useAnchorMenu<HTMLButtonElement>('.dropdown-menu');
  const specs = operatorsFor(field.kind);
  const current = specs.find((spec) => spec.id === op) ?? specs[0];

  const handlePick = (id: string): void => {
    onChange(id);
    menu.close();
  };

  const items = operatorMenuItems({
    kind: field.kind,
    op,
    caseSensitive,
    onPickOperator: handlePick,
    onToggleCaseSensitive: onChangeCaseSensitive,
  });

  // A flag left over from when this path held text — the field's kind can drift
  // under a saved view — must not advertise a modifier the menu no longer
  // offers, and that no tester would honour either.
  const marked = caseSensitive === true && supportsCaseModifier(field.kind);
  const label = current ? `Filter operator: ${current.label}` : 'Filter operator';

  return (
    <>
      <Button
        ref={menu.anchorRef}
        variant="tertiary"
        size="sm"
        className={`filter-bar__operator-button${marked ? ' filter-bar__operator-button--cased' : ''}`}
        aria-haspopup="menu"
        aria-expanded={menu.open}
        aria-label={marked ? `${label}${CASE_SENSITIVE_SUFFIX}` : label}
        onClick={menu.toggle}
      >
        {current ? glyphForOperatorIcon(current.icon) : '?'}
      </Button>
      {menu.open && items.length > 0 && <DropdownMenu items={items} anchorRef={menu.anchorRef} />}
    </>
  );
};

export { OperatorMenu };
export type { OperatorMenuProps };
