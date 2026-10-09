/* @layer renderer-components @kind component */
import { Box, Text } from '@ds/primitives';
import { CapacityFamilyRow } from '../CapacityFamilyRow';
import { RandomizerOptionGroup } from '../RandomizerOptionGroup';
import { RandomizerOptionRow } from '../RandomizerOptionRow';
import type { CapacityUpgradesBlockProps } from './CapacityUpgradesBlock.type';
import './CapacityUpgradesBlock.css';

const CapacityUpgradesBlock = (props: CapacityUpgradesBlockProps) => {
  const {
    rows, notes, enabledOption, enabled = true, progressiveOption, progressive = false, readOnly = false,
    onChange, onBonusChange, onEnabledChange, onProgressiveChange,
  } = props;
  const frozen = readOnly || !enabled;

  return (
    <RandomizerOptionGroup title="Capacity upgrades" live className="capacity-block">
      {enabledOption !== undefined && (
        <RandomizerOptionRow
          option={enabledOption}
          value={enabled}
          disabled={readOnly}
          readout={readOnly}
          onChange={readOnly || onEnabledChange === undefined ? undefined : (next) => onEnabledChange(Boolean(next))}
        />
      )}
      <Box className={`capacity-block__body${enabled ? '' : ' capacity-block__body--off'}`}>
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
      </Box>
      {notes.map((note) => (
        <Text key={note} className="capacity-block__note">{note}</Text>
      ))}
    </RandomizerOptionGroup>
  );
};

export { CapacityUpgradesBlock };
export type { CapacityUpgradesBlockProps };
