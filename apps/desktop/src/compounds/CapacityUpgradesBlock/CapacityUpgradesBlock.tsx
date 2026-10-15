/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { RandomizerOptionGroup } from '../RandomizerOptionGroup';
import { RandomizerOptionRow } from '../RandomizerOptionRow';
import type { CapacityUpgradesBlockProps } from './CapacityUpgradesBlock.type';
import { CapacityRows } from './sub-components/CapacityRows';
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
        <CapacityRows
          rows={rows}
          progressiveOption={progressiveOption}
          progressive={progressive}
          frozen={frozen}
          readOnly={readOnly}
          onChange={onChange}
          onBonusChange={onBonusChange}
          onProgressiveChange={onProgressiveChange}
        />
      </Box>
      {notes.map((note) => (
        <Text key={note} className="capacity-block__note">{note}</Text>
      ))}
    </RandomizerOptionGroup>
  );
};

export { CapacityUpgradesBlock };
