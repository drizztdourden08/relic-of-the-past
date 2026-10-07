/* @layer renderer-components @kind component */
/**
 * The scope-aware variable menu, the autocomplete and the worked starting
 * points are ONE list with two triggers, because they are the same question.
 *
 * A POPOVER, NOT A DOCKED PANEL. The plan's first sketch kept the variables
 * permanently visible beside a focused expression, after After Effects and
 * Blender. Fifteen names plus three scoped ones is eighteen rows, about 290 px,
 * taller than most whole SECTIONS of this panel at a 289 px rail. A filtered
 * popover is what the width permits, and it is what the autocomplete needed
 * anyway: typing a letter filters this same list.
 *
 * IT REGISTERS AT `popover` (contract §33). `Escape` therefore closes the menu
 * and leaves both the field and the editor behind it alone, whether the menu
 * mounted before or after them. Level beats registration order, which is the
 * whole point of the stack.
 *
 * `&&` AND `||` APPEAR NOWHERE. `||` was a live silent-wrong-number bug until
 * `concatenate: false` landed; the menu's job is to make the mistake hard to
 * reach for, not to explain it afterwards.
 */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import { TextInput } from '@ds/primitives/TextInput';
import { Portal, usePickerPopover } from '@ds/primitives/Portal';
import { formulaGroups } from '../../../behavior/formula-catalog';
import { formulaStarters } from '../../../behavior/formula-starters';
import type { RefObject } from 'react';
import type { StarterRole } from '../../../behavior/formula-starters';

interface FormulaMenuProps {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  /** The identifier under the caret. Empty opens the menu unfiltered. */
  filter: string;
  role: StarterRole;
  insideRepeat: boolean;
  extraNames?: readonly string[];
  scope: Readonly<Record<string, number>>;
  onClose: () => void;
  onInsert: (snippet: string, select?: string) => void;
}

const matches = (name: string, filter: string): boolean =>
  filter.length === 0 || name.toLowerCase().includes(filter.toLowerCase());

const reading = (name: string, scope: Readonly<Record<string, number>>): string =>
  (name in scope ? String(scope[name]) : '');

const FormulaMenu = (props: FormulaMenuProps) => {
  const { open, anchorRef, filter, role, insideRepeat, extraNames, scope, onClose, onInsert } = props;
  const { position, panelRef } = usePickerPopover({
    open, anchorRef, onClose, estimatedWidth: 248, estimatedHeight: 300,
  });

  if (!open) return null;

  const starters = formulaStarters({ role, insideRepeat }).filter((s) => matches(s.title, filter));
  const groups = formulaGroups({ insideRepeat, extraNames })
    .map((group) => ({ ...group, items: group.items.filter((item) => matches(item.name, filter)) }))
    .filter((group) => group.items.length > 0);

  return (
    <Portal layer="popover">
      <Box
        ref={panelRef}
        className="hud-formula-menu"
        data-drop-up={position?.dropUp ? 'true' : undefined}
        style={position ? { top: position.top, left: position.left } : undefined}
      >
        {filter.length > 0 && (
          <Box className="hud-formula-menu__filter">
            <TextInput size="sm" value={filter} readOnly aria-label="Filtering formula names" />
          </Box>
        )}

        {starters.length > 0 && (
          <Box className="hud-formula-menu__group">
            <Text className="hud-formula-menu__head">{role === 'gate' ? 'Only when...' : 'Drive this from the game...'}</Text>
            {starters.map((starter) => (
              <Button
                key={starter.expr}
                variant="bare"
                className="hud-formula-menu__row"
                onClick={() => onInsert(starter.expr, starter.select)}
              >
                <Text className="hud-formula-menu__title">{starter.title}</Text>
                <Text className="hud-formula-menu__expr">{starter.expr}</Text>
              </Button>
            ))}
          </Box>
        )}

        {groups.map((group) => (
          <Box key={group.title} className="hud-formula-menu__group">
            <Text className="hud-formula-menu__head">{group.title}</Text>
            {group.items.map((item) => (
              <Button
                key={item.name}
                variant="bare"
                disabled={item.unavailable !== undefined}
                className={`hud-formula-menu__row${item.unavailable ? ' is-unavailable' : ''}`}
                title={item.unavailable ?? item.note}
                onClick={() => onInsert(item.name)}
              >
                <Text className="hud-formula-menu__title">{item.name}</Text>
                <Text className="hud-formula-menu__expr">{item.unavailable ?? (reading(item.name, scope) || item.note)}</Text>
              </Button>
            ))}
          </Box>
        ))}

        {starters.length === 0 && groups.length === 0 && (
          <Text className="hud-formula-menu__head">Nothing here is called &quot;{filter}&quot;.</Text>
        )}
      </Box>
    </Portal>
  );
};

export { FormulaMenu };
export type { FormulaMenuProps };
