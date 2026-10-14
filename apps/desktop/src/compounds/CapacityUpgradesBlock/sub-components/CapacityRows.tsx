/* @layer renderer-components @kind component */
import { CapacityFamilyRow } from '../../CapacityFamilyRow';
import { RandomizerOptionRow } from '../../RandomizerOptionRow';
import type { CapacityRowsProps } from '../CapacityUpgradesBlock.type';

const CapacityRows = (props: CapacityRowsProps) => {
  const {
    rows, progressiveOption, progressive, frozen, readOnly, onChange, onBonusChange, onProgressiveChange,
  } = props;

  return (
    <>
      {progressiveOption !== undefined && (
        <RandomizerOptionRow
          option={progressiveOption}
          value={progressive}
          disabled={frozen}
          readout={readOnly}
          onChange={frozen || onProgressiveChange === undefined ? undefined : (next) => onProgressiveChange(Boolean(next))}
        />
      )}
      {rows.map((row) => (
        <CapacityFamilyRow
          key={row.id}
          model={row}
          readOnly={frozen}
          readout={readOnly}
          onChange={frozen || onChange === undefined ? undefined : (next) => onChange(row.id, next)}
          onBonusChange={frozen || onBonusChange === undefined ? undefined : (next) => onBonusChange(row.id, next)}
        />
      ))}
    </>
  );
};

export { CapacityRows };
