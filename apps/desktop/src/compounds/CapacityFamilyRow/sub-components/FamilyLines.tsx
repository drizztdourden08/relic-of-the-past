/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { LadderPreview } from '../../LadderPreview';
import type { FamilyLinesProps } from '../CapacityFamilyRow.type';
import { BonusLine } from './BonusLine';
import { LadderControls } from './LadderControls';
import { RowLine } from './RowLine';

const FamilyLines = ({ model, inert, readout, onChange, onBonusChange }: FamilyLinesProps) => {
  const { state, preview, bonus, bonusCaption } = model;

  return (
    <Box className="capacity-row__lines">
      {state.mode === 'custom' && <LadderControls model={model} readOnly={inert} readout={readout} onChange={onChange} />}
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
  );
};

export { FamilyLines };
