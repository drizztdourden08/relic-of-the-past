/* @layer renderer-components @kind component */
import { useEffect, useMemo, useState } from 'react';
import { Button, Field, Flex, TextInput } from '@drizztdourden08/tessera/primitives';
import { FactsPanel } from '@drizztdourden08/tessera/composites';
import type { FactsPanelGroup } from '@drizztdourden08/tessera/composites';
import { formatBytes } from '@drizztdourden08/brock-core';
import { useT } from '@drizztdourden08/brock-react';
import { StudioSection } from '@app/studio';
import type { PackPropertiesProps } from './studio-frame.type';

const PackProperties = (props: PackPropertiesProps) => {
  const { pack, format, slotCount, fileCount, totalSize, isDeluxe, hasOpuz, busy, readOnly, onRename } = props;
  const t = useT();
  const [draftName, setDraftName] = useState(pack);

  useEffect(() => { setDraftName(pack); }, [pack]);
  const renameReady = !readOnly && draftName.trim().length > 0 && draftName.trim() !== pack;

  const groups = useMemo<FactsPanelGroup[]>(() => [[
    {
      label: t('msu-studio:pack.facts.format'),
      value: format === 'layered' ? t('msu-studio:pack.format.layered') : t('msu-studio:pack.format.classic'),
    },
    {
      label: t('msu-studio:pack.facts.slots'),
      value: isDeluxe ? t('msu-studio:pack.slots.extended') : t('msu-studio:pack.slots.standard'),
    },
    { label: t('msu-studio:pack.facts.slots-filled'), value: slotCount, mono: true },
    { label: t('msu-studio:pack.facts.files'), value: fileCount, mono: true },
    { label: t('msu-studio:pack.facts.size'), value: formatBytes(totalSize), mono: true },
    ...(hasOpuz
      ? [{ label: t('msu-studio:pack.facts.audio'), value: t('msu-studio:pack.facts.needs-conversion') }]
      : []),
  ]], [t, slotCount, fileCount, totalSize, isDeluxe, format, hasOpuz]);

  return (
    <StudioSection title={t('msu-studio:pack.title')}>
      <Field label={t('msu-studio:pack.name')}>
        <Flex gap="xs" align="center">
          <TextInput
            type="text"
            value={draftName}
            aria-label={t('msu-studio:pack.name.aria')}
            disabled={readOnly}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && renameReady && !busy) onRename(draftName); }}
          />
          <Button variant="secondary" size="sm" disabled={busy || !renameReady} onClick={() => onRename(draftName)}>
            {t('msu-studio:pack.rename')}
          </Button>
        </Flex>
      </Field>
      <FactsPanel groups={groups} layout="rows" label={t('msu-studio:pack.facts.label')} />
    </StudioSection>
  );
};

export { PackProperties };
