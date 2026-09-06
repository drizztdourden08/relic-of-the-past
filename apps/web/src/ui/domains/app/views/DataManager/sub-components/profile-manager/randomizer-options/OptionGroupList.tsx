/* @layer renderer-components @kind component */
/**
 * The bubbled-up option rows of one tab: the sections a tab owns, each still
 * under its own catalog heading, each row carrying its In Pool cell. Given no
 * change handler the rows render as the catalog's own fixed values, and the
 * shape the locked sections take. `frozenKeys` names the rows a sibling
 * setting has taken out of the player's hands, so they grey out instead of
 * offering a control that could not change the seed, and `notes` carries the
 * sentence saying which setting did it, one per row, so the reason sits on the
 * row it explains instead of in a list underneath them all.
 */
import { RandomizerOptionRow } from '@domains/app/compounds/RandomizerOptionRow';
import { RandomizerOptionGroup } from '@domains/app/compounds/RandomizerOptionGroup';
import type { LockedOptionGroup } from '@domains/app/compounds/RandomizerOptionRow';
import type { ImpactCell } from '@domains/app/compounds/PoolImpactCell';
import type { ApOptionDef, ApOptionValue } from '@shared/randomizer/ap-world/options.type';

interface OptionGroupListProps {
  groups: readonly LockedOptionGroup[];
  /** The value each row shows. */
  valueOf: (option: ApOptionDef) => ApOptionValue;
  cellOf: (key: string) => ImpactCell;
  /** The player's own sections; absent renders the group as a fixed one. */
  live?: boolean;
  /** Unlocked rows this tab freezes anyway, where a sibling setting decides them. */
  frozenKeys?: ReadonlySet<string>;
  /** Per-row reason a frozen row is showing a value the player did not choose. */
  notes?: ReadonlyMap<string, string>;
  onRowChange?: (key: string, next: ApOptionValue) => void;
}

const OptionGroupList = (props: OptionGroupListProps) => {
  const { groups, valueOf, cellOf, live = false, frozenKeys, notes, onRowChange } = props;

  return (
    <>
      {groups.map(({ group, options }) => (
        <RandomizerOptionGroup key={`${live ? 'live-' : ''}${group.id}`} title={group.label} live={live}>
          {options.map((option) => (
            <RandomizerOptionRow
              key={option.key}
              option={option}
              value={valueOf(option)}
              impact={cellOf(option.key)}
              disabled={frozenKeys?.has(option.key)}
              note={notes?.get(option.key)}
              onChange={onRowChange === undefined ? undefined : (next) => onRowChange(option.key, next)}
            />
          ))}
        </RandomizerOptionGroup>
      ))}
    </>
  );
};

export { OptionGroupList };
export type { OptionGroupListProps };
