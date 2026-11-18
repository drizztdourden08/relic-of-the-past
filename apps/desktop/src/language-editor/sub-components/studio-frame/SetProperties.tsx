/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { FactsPanel } from '@drizztdourden08/tessera/composites';
import type { FactsPanelGroup } from '@drizztdourden08/tessera/composites';
import { useT, useText } from '@drizztdourden08/brock-react';
import { StudioSection } from '@app/studio';
import { SOURCE_LABELS } from './studio-frame.constants';
import { LANGUAGE_NAMES } from '../../../views/DataManager/sub-components/language-names.constants';
import type { SetPropertiesProps } from './studio-frame.type';

const SetProperties = (props: SetPropertiesProps) => {
  const { set, warnings } = props;
  const t = useT();
  const text = useText();
  const base = LANGUAGE_NAMES[set.base] ?? set.base;

  const groups = useMemo<FactsPanelGroup[]>(() => [[
    { label: t('language-editor:set.name'), value: set.name },
    { label: t('language-editor:set.id'), value: set.id, mono: true },
    { label: t('language-editor:set.source'), value: text(SOURCE_LABELS[set.origin](base)) },
    { label: t('language-editor:set.lines'), value: set.dialogue.length, mono: true },
    { label: t('language-editor:set.terms'), value: set.glossary.length, mono: true },
    { label: t('language-editor:set.attention'), value: warnings, mono: true },
  ]], [t, text, set.name, set.id, set.origin, set.dialogue.length, set.glossary.length, base, warnings]);

  return (
    <StudioSection title={t('language-editor:set.title')}>
      <FactsPanel groups={groups} layout="rows" label={t('language-editor:set.label')} />
    </StudioSection>
  );
};

export { SetProperties };
