/* @layer renderer-components @kind logic */
import { OPTIONS_SLICE } from '@drizztdourden08/brock-randomizer/renderer';
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import { buildOptionsSnapshot } from '@rotp/randomizer';
import { optionValuesOf } from '@app/randomizer/options/option-values-of';
import { buildOptionFactGroups } from '../../profile-detail/build-option-facts';
import type { ProfileWizardValues } from '../ProfileCreateWizard.type';

const overridesOf = (values: ProfileWizardValues): unknown => {
  const slice = values[OPTIONS_SLICE];
  return typeof slice === 'object' && slice !== null && 'overrides' in slice ? slice.overrides : {};
};

const optionRows = (values: ProfileWizardValues): FactsPanelFact[] => {
  const snapshot = buildOptionsSnapshot(optionValuesOf(overridesOf(values)));
  const rows = buildOptionFactGroups(snapshot).flatMap(({ title, facts }) => facts.map((fact) => ({ ...fact, label: `${title}: ${fact.label}` })));
  return rows.length === 0 ? [{ label: 'Options', value: 'All at the default' }] : rows;
};

export { optionRows };
