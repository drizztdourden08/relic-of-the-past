/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import type { SettingsSectionRow } from '@drizztdourden08/tessera/composites';
import { RequiredInputState } from './RequiredInputState';
import type { RequiredInput } from '../controls-settings/controls-settings.type';

const requiredInputRows = (inputs: readonly RequiredInput[]): SettingsSectionRow[] =>
  inputs.map((input) => ({
    id: `required-${input.type}`,
    title: input.label,
    noDescription: true,
    hint: input.connected ? `${input.label} is connected.` : `${input.label} is not connected.`,
    input: { kind: 'custom', control: createElement(RequiredInputState, { input }) },
  }));

export { requiredInputRows };
