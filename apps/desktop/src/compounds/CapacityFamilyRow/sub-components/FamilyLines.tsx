/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { LadderStepper } from '@app/composites/LadderStepper';
import type { FamilyLinesProps } from '../CapacityFamilyRow.type';
import { BonusLine } from './BonusLine';
import { LadderControls } from './LadderControls';
import { RowLine } from './RowLine';

const FamilyLines = ({ model, inert, readout, onChange, onBonusChange }: FamilyLinesProps) => {
  const { state, label, preview, bonus, bonusCaption } = model;

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
        <Box className="capacity-row__preview">
          <LadderStepper label={label} steps={preview.steps} size="compact" mediaPlacement="below" showLabels={false} />
          {preview.note !== undefined && <Text className="capacity-row__preview-note">{preview.note}</Text>}
        </Box>
      </RowLine>
    </Box>
  );
};

export { FamilyLines };
