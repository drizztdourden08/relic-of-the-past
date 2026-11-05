/* @layer renderer-components @kind logic */
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import { buildOptionFactGroups } from '../../profile-detail/build-option-facts';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';
import { optionsSnapshotOf } from './options-snapshot-of';

const optionRows = (values: ProfileWizardValues): FactsPanelFact[] => {
  const rows = buildOptionFactGroups(optionsSnapshotOf(values)).flatMap(({ title, facts }) => facts.map((fact) => ({ ...fact, label: `${title}: ${fact.label}` })));
  return rows.length === 0 ? [{ label: 'Options', value: 'All at the default' }] : rows;
};

export { optionRows };
