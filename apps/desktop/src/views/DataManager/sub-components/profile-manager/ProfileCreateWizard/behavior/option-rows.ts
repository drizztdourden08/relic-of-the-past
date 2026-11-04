/* @layer renderer-components @kind logic */
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import { snapshotOfChoices } from '@app/hooks/randomizer/randomizer-choices';
import { buildOptionFactGroups } from '../../profile-detail/build-option-facts';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';

const optionRows = ({ randomizer }: ProfileWizardValues): FactsPanelFact[] => {
  const rows = buildOptionFactGroups(snapshotOfChoices(randomizer))
    .flatMap(({ title, facts }) => facts.map((fact) => ({ ...fact, label: `${title}: ${fact.label}` })));
  return rows.length === 0 ? [{ label: 'Options', value: 'All at the default' }] : rows;
};

export { optionRows };
