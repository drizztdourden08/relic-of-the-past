/* @layer renderer-components @kind logic */
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import { formatBytes } from '@drizztdourden08/brock-core';
import { QUICK_SLOTS } from '@app/storage/save-files/save-files.constants';
import type { ProfileData } from './profile-data.type';

const buildSaveFacts = (data: ProfileData): FactsPanelFact[] => {
  const { manual, auto, quick, sramBytes } = data;
  const bytes = [...manual, ...auto, ...quick].reduce((sum, info) => sum + info.size, 0) + (sramBytes ?? 0);
  return [
    { label: 'Manual saves', value: String(manual.length) },
    { label: 'Auto-saves', value: String(auto.length) },
    { label: 'Quick-save slots', value: `${quick.length} of ${QUICK_SLOTS} used` },
    { label: 'Battery save', value: sramBytes === null ? 'None' : formatBytes(sramBytes) },
    { label: 'Save data size', value: formatBytes(bytes) },
  ];
};

export { buildSaveFacts };
