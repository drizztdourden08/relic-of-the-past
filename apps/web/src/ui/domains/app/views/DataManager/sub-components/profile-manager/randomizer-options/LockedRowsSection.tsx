/* @layer renderer-components @kind component */
/**
 * The fixed rows a tab keeps beneath its live ones, merged under one heading
 * of their own. Nothing here unlocks anything: every row renders exactly as
 * the catalog defines it, control disabled, the catalog's own tag saying
 * whether the value is fixed by this version or the feature is absent.
 */
import { RandomizerOptionGroup } from '@domains/app/compounds/RandomizerOptionGroup';
import { RandomizerOptionRow } from '@domains/app/compounds/RandomizerOptionRow';
import type { LockedOptionGroup } from '@domains/app/compounds/RandomizerOptionRow';
import type { ImpactCell } from '@domains/app/compounds/PoolImpactCell';
import type { ApOptionDef, ApOptionValue } from '@shared/randomizer/ap-world/options.type';

interface LockedRowsSectionProps {
  /** The one heading the merged rows sit under. */
  title: string;
  /** The tab's fixed groups, as the tab model split them. */
  groups: readonly LockedOptionGroup[];
  valueOf: (option: ApOptionDef) => ApOptionValue;
  cellOf: (key: string) => ImpactCell;
}

const LockedRowsSection = (props: LockedRowsSectionProps) => {
  const { title, groups, valueOf, cellOf } = props;

  const options = groups.flatMap((entry) => entry.options);
  if (options.length === 0) return null;

  return (
    <RandomizerOptionGroup title={title}>
      {options.map((option) => (
        <RandomizerOptionRow
          key={option.key}
          option={option}
          value={valueOf(option)}
          impact={cellOf(option.key)}
        />
      ))}
    </RandomizerOptionGroup>
  );
};

export { LockedRowsSection };
export type { LockedRowsSectionProps };
