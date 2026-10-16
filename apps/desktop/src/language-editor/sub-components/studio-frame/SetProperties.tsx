/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { FactsPanel } from '@drizztdourden08/tessera/composites';
import type { FactsPanelGroup } from '@drizztdourden08/tessera/composites';
import { SunkenWell } from '@app/compounds/SunkenWell';
import { LANGUAGE_NAMES } from '../../../views/DataManager/sub-components/language-names.constants';
import type { SetPropertiesProps } from './studio-frame.type';

const SetProperties = (props: SetPropertiesProps) => {
  const { set, warnings } = props;
  const base = LANGUAGE_NAMES[set.base] ?? set.base;

  const groups = useMemo<FactsPanelGroup[]>(() => [[
    { label: 'Id', value: set.id, mono: true },
    { label: 'Source', value: set.origin === 'rom' ? `From a ${base} ROM` : `Based on ${base}` },
    { label: 'Lines', value: set.dialogue.length, mono: true },
    { label: 'Terms', value: set.glossary.length, mono: true },
    { label: 'Need attention', value: warnings, mono: true },
  ]], [set.id, set.origin, set.dialogue.length, set.glossary.length, base, warnings]);

  return (
    <SunkenWell>
      <FactsPanel groups={groups} layout="rows" label="Language set properties" />
    </SunkenWell>
  );
};

export { SetProperties };
