/* @layer renderer-components @kind component */
import { Box, Button, Text, TextInput, Portal, usePickerPopover } from '@drizztdourden08/tessera/primitives';
import { formulaGroups } from '../../../behavior/formula-catalog';
import { formulaStarters } from '../../../behavior/formula-starters';
import type { FormulaMenuProps } from './FormulaMenu.type';

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
export type { FormulaMenuProps } from './FormulaMenu.type';
