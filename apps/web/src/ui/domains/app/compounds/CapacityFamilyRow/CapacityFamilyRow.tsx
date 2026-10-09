/* @layer renderer-components @kind component */
import { Box, Select, Text } from '@drizztdourden08/tessera/primitives';
import { LadderPreview } from '../LadderPreview';
import { OptionDescription } from '../OptionDescription';
import { OptionValueTag, choiceLabelOf } from '../OptionValueTag';
import { PoolImpactCell } from '../PoolImpactCell';
import { BonusLine } from './sub-components/BonusLine';
import { LadderControls } from './sub-components/LadderControls';
import { RowLine } from './sub-components/RowLine';
import { MODE_OPTIONS, WALLET_MODE_OPTIONS } from './CapacityFamilyRow.constants';
import type { CapacityFamilyRowProps, CapacityRowState } from './CapacityFamilyRow.type';
import type { SelectOption } from '@drizztdourden08/tessera/primitives';
import './CapacityFamilyRow.css';

const CapacityFamilyRow = (props: CapacityFamilyRowProps) => {
  const { model, readOnly = false, readout = false, onChange, onBonusChange } = props;
  const { label, caption, offersInPool, state, preview, impact, footnote, forced, bonus, bonusCaption } = model;
  const inert = readOnly || forced !== undefined;

  const patch = (part: Partial<CapacityRowState>) => onChange?.({ ...state, ...part });

  return (
    <Box className={`capacity-row${forced !== undefined ? ' capacity-row--forced' : ''}`}>
      <Box className="capacity-row__head">
        <Box className="capacity-row__text">
          <Text className="capacity-row__label">{label}</Text>
          {caption !== undefined && <OptionDescription className="capacity-row__caption" description={caption} />}
        </Box>
        <Box className="capacity-row__mode">
          {readout ? <OptionValueTag value={choiceLabelOf(MODE_OPTIONS, state.mode)} /> : (
            <Select
              size="sm"
              value={state.mode}
              options={(offersInPool ? MODE_OPTIONS : WALLET_MODE_OPTIONS) as SelectOption[]}
              onChange={(mode) => patch({ mode: mode as CapacityRowState['mode'] })}
              disabled={inert}
            />
          )}
        </Box>
        <PoolImpactCell cell={impact} />
      </Box>
      {forced !== undefined && <Text className="capacity-row__forced">{forced}</Text>}
      <Box className="capacity-row__lines">
        {state.mode === 'custom' && <LadderControls model={model} readOnly={inert} readout={readout} onChange={patch} />}
        {bonus !== undefined && (
          <BonusLine
            bonus={bonus}
            caption={bonusCaption}
            readOnly={inert}
            readout={readout}
            onChange={inert ? undefined : onBonusChange}
          />
        )}
        <RowLine label="ladder" className="capacity-row__ladder">
          <LadderPreview {...preview} />
        </RowLine>
      </Box>
      {footnote !== undefined && <Text className="capacity-row__footnote">{footnote}</Text>}
    </Box>
  );
};

export { CapacityFamilyRow };
