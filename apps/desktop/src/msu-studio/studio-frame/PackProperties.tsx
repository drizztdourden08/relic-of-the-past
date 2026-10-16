/* @layer renderer-components @kind component */
import { useEffect, useMemo, useState } from 'react';
import { Button, Field, Flex, TextInput } from '@drizztdourden08/tessera/primitives';
import { FactsPanel } from '@drizztdourden08/tessera/composites';
import type { FactsPanelGroup } from '@drizztdourden08/tessera/composites';
import { formatBytes } from '@drizztdourden08/brock-core';
import { StudioSection } from '@app/studio';
import type { PackPropertiesProps } from './studio-frame.type';

const PackProperties = (props: PackPropertiesProps) => {
  const { pack, format, slotCount, fileCount, totalSize, isDeluxe, hasOpuz, busy, readOnly, onRename } = props;
  const [draftName, setDraftName] = useState(pack);

  useEffect(() => { setDraftName(pack); }, [pack]);
  const renameReady = !readOnly && draftName.trim().length > 0 && draftName.trim() !== pack;

  const groups = useMemo<FactsPanelGroup[]>(() => [[
    { label: 'Format', value: format === 'layered' ? 'Layered' : 'Classic' },
    { label: 'Slots', value: isDeluxe ? 'Extended' : 'Standard' },
    { label: 'Slots filled', value: slotCount, mono: true },
    { label: 'Files', value: fileCount, mono: true },
    { label: 'Size', value: formatBytes(totalSize), mono: true },
    ...(hasOpuz ? [{ label: 'Audio', value: 'Needs conversion' }] : []),
  ]], [slotCount, fileCount, totalSize, isDeluxe, format, hasOpuz]);

  return (
    <StudioSection title="Pack">
      <Field label="Name">
        <Flex gap="xs" align="center">
          <TextInput
            type="text"
            value={draftName}
            aria-label="Pack name"
            disabled={readOnly}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && renameReady && !busy) onRename(draftName); }}
          />
          <Button variant="secondary" size="sm" disabled={busy || !renameReady} onClick={() => onRename(draftName)}>
            Rename
          </Button>
        </Flex>
      </Field>
      <FactsPanel groups={groups} layout="rows" label="Music pack properties" />
    </StudioSection>
  );
};

export { PackProperties };
