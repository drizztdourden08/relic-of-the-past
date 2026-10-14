/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { FamilyHead } from './sub-components/FamilyHead';
import { FamilyLines } from './sub-components/FamilyLines';
import type { CapacityFamilyRowProps, CapacityRowState } from './CapacityFamilyRow.type';
import './CapacityFamilyRow.css';

const CapacityFamilyRow = (props: CapacityFamilyRowProps) => {
  const { model, readOnly = false, readout = false, onChange, onBonusChange } = props;
  const { state, footnote, forced } = model;
  const inert = readOnly || forced !== undefined;

  const patch = (part: Partial<CapacityRowState>) => onChange?.({ ...state, ...part });
  const pickMode = (mode: CapacityRowState['mode']) => patch({ mode });

  return (
    <Box className={`capacity-row${forced !== undefined ? ' capacity-row--forced' : ''}`}>
      <FamilyHead model={model} readout={readout} disabled={inert} onPick={pickMode} />
      {forced !== undefined && <Text className="capacity-row__forced">{forced}</Text>}
      <FamilyLines model={model} inert={inert} readout={readout} onChange={patch} onBonusChange={onBonusChange} />
      {footnote !== undefined && <Text className="capacity-row__footnote">{footnote}</Text>}
    </Box>
  );
};

export { CapacityFamilyRow };
