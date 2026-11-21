/* @layer renderer-components @kind component */
import './FormulaMenu.css';
import { Anchored, Box, Pressable, Text, TextInput } from '@drizztdourden08/tessera/primitives';
import { formulaGroups } from '@app/hud-layout-editing/formula-catalog';
import { formulaStarters } from '@app/hud-layout-editing/formula-starters';
import type { FormulaMenuProps } from './FormulaMenu.type';
import { useT, useText } from '@drizztdourden08/brock-react';

const matches = (name: string, filter: string): boolean =>
  filter.length === 0 || name.toLowerCase().includes(filter.toLowerCase());

const reading = (name: string, scope: Readonly<Record<string, number>>): string =>
  (name in scope ? String(scope[name]) : '');

const FormulaMenu = (props: FormulaMenuProps) => {
  const t = useT();
  const text = useText();
  const { open, anchorRef, filter, role, insideRepeat, extraNames, scope, onClose, onInsert } = props;

  if (!open) return null;

  const starters = formulaStarters({ role, insideRepeat }).filter((s) => matches(text(s.title), filter));
  const groups = formulaGroups({ insideRepeat, extraNames })
    .map((group) => ({ ...group, items: group.items.filter((item) => matches(item.name, filter)) }))
    .filter((group) => group.items.length > 0);

  return (
    <Anchored anchorRef={anchorRef} placement="bottom-start" layer="popover" className="hud-formula-menu" onDismiss={onClose}>
        {filter.length > 0 && (
          <Box className="hud-formula-menu__filter">
            <TextInput size="sm" value={filter} readOnly aria-label={t('hud-editor:formula-menu.aria.filtering-formula-names')} />
          </Box>
        )}

        {starters.length > 0 && (
          <Box className="hud-formula-menu__group">
            <Text className="hud-formula-menu__head">{role === 'gate' ? t('hud-editor:formula-menu.head.gate') : t('hud-editor:formula-menu.head.number')}</Text>
            {starters.map((starter) => (
              <Pressable
                key={starter.expr}
                className="hud-formula-menu__row"
                onClick={() => onInsert(starter.expr, starter.select)}
              >
                <Text className="hud-formula-menu__title">{text(starter.title)}</Text>
                <Text className="hud-formula-menu__expr">{starter.expr}</Text>
              </Pressable>
            ))}
          </Box>
        )}

        {groups.map((group) => (
          <Box key={text(group.title)} className="hud-formula-menu__group">
            <Text className="hud-formula-menu__head">{text(group.title)}</Text>
            {group.items.map((item) => (
              <Pressable
                key={item.name}
                disabled={item.unavailable !== undefined}
                className={`hud-formula-menu__row${item.unavailable ? ' is-unavailable' : ''}`}
                title={text(item.unavailable ?? item.note)}
                onClick={() => onInsert(item.name)}
              >
                <Text className="hud-formula-menu__title">{item.name}</Text>
                <Text className="hud-formula-menu__expr">{item.unavailable === undefined ? (reading(item.name, scope) || text(item.note)) : text(item.unavailable)}</Text>
              </Pressable>
            ))}
          </Box>
        ))}

        {starters.length === 0 && groups.length === 0 && (
          <Text className="hud-formula-menu__head">{t('hud-editor:formula-menu.empty', { filter })}</Text>
        )}
    </Anchored>
  );
};

export { FormulaMenu };
