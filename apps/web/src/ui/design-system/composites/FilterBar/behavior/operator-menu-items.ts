/* @layer renderer-components @kind logic */
/**
 * The operator dropdown's entries: every operator the kind supports, plus a
 * "match case" toggle for text only. Other kinds match exactly or compare
 * existence, so the modifier would promise something no tester honours. Pure,
 * so the menu is testable without a dropdown.
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
