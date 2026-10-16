/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { FactsPanel } from '@drizztdourden08/tessera/composites';
import type { FactsPanelGroup } from '@drizztdourden08/tessera/composites';
import { StudioSection } from '@app/studio';
import { LANGUAGE_NAMES } from '../../../views/DataManager/sub-components/language-names.constants';
import type { SetPropertiesProps } from './studio-frame.type';

const SetProperties = (props: SetPropertiesProps) => {
  const { set, warnings } = props;
  const base = LANGUAGE_NAMES[set.base] ?? set.base;

  const groups = useMemo<FactsPanelGroup[]>(() => [[
    { label: 'Name', value: set.name },
    { label: 'Id', value: set.id, mono: true },
    { label: 'Source', value: set.origin === 'rom' ? `From a ${base} ROM` : `Based on ${base}` },
    { label: 'Lines', value: set.dialogue.length, mono: true },
    { label: 'Terms', value: set.glossary.length, mono: true },
    { label: 'Need attention', value: warnings, mono: true },
  ]], [set.name, set.id, set.origin, set.dialogue.length, set.glossary.length, base, warnings]);

  return (
    <StudioSection title="Set">
      <FactsPanel groups={groups} layout="rows" label="Language set properties" />
    </StudioSection>
  );
};

export { SetProperties };
