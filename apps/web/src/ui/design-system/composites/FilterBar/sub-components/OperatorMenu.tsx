/* @layer renderer-components @kind component */
/**
 * The operator picker for one clause. The button shows only the glyph; the
 * dropdown lists every operator with glyph and label, plus the comparison
 * modifiers. Picking an operator closes the menu; toggling a modifier keeps it
 * open. Case-sensitive is marked with colour so the button does not widen.
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

  // A field's kind can drift under a saved view; a leftover flag must not
  // advertise a modifier no tester would honour.
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
