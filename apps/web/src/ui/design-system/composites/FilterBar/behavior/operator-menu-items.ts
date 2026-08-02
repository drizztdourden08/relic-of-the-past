/* @layer renderer-components @kind logic */
/**
 * What the operator dropdown offers for one clause: every operator its field
 * kind supports, plus — for text only — a "match case" modifier below a
 * separator.
 *
 * The modifier lives in the same menu as the operators because it is the same
 * question ("how should this clause compare?") and a filter row is one line
 * tall, with no room for a second control. It is a toggle rather than a choice,
 * so it is marked with the menu's own check mark and the operators keep their
 * exclusive selection above it.
 *
 * Only the text kind gets it. Closed sets and id references match exactly by
 * design (both kits say so in their own doc comments), numbers and booleans
 * have no case, and the kinds left over compare existence only — offering the
 * modifier there would promise something no tester honours.
 *
 * Pure, and free of JSX, so the menu's contents are unit tested without
 * opening a real dropdown.
 */
import { operatorsFor } from '../../../data/filter/operators';
import { glyphForOperatorIcon } from '../sub-components/operator-icon-glyphs';
import type { MenuEntry } from '../../DropdownMenu';
import type { FieldKind } from '../../../data/schema/field-descriptor';

const MATCH_CASE_KEY = 'match-case';
const MATCH_CASE_LABEL = 'Match case';

/** The one glyph in this menu that is a word: no symbol reads as "casing". */
const MATCH_CASE_ICON = 'Aa';

const supportsCaseModifier = (kind: FieldKind): boolean => kind === 'string';

interface OperatorMenuInput {
  kind: FieldKind;
  op: string;
  caseSensitive?: boolean;
  onPickOperator: (id: string) => void;
  /** Omitted by a caller that does not want the modifier offered at all. */
  onToggleCaseSensitive?: (next: boolean) => void;
}

const operatorMenuItems = (input: OperatorMenuInput): MenuEntry[] => {
  const { kind, op, caseSensitive, onPickOperator, onToggleCaseSensitive } = input;

  const items: MenuEntry[] = operatorsFor(kind).map((spec) => ({
    key: spec.id,
    icon: glyphForOperatorIcon(spec.icon),
    label: spec.label,
    checked: spec.id === op,
    onClick: () => onPickOperator(spec.id),
  }));

  if (!onToggleCaseSensitive || !supportsCaseModifier(kind)) return items;

  return [...items, 'separator', {
    key: MATCH_CASE_KEY,
    icon: MATCH_CASE_ICON,
    label: MATCH_CASE_LABEL,
    checked: caseSensitive === true,
    onClick: () => onToggleCaseSensitive(caseSensitive !== true),
  }];
};

export { MATCH_CASE_KEY, MATCH_CASE_LABEL, operatorMenuItems, supportsCaseModifier };
export type { OperatorMenuInput };
