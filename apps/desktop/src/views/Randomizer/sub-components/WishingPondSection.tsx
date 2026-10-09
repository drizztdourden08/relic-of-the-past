/* @layer renderer-components @kind component */
import { useCallback, useMemo, useState } from 'react';
import { Box, Tabs, Text, Toggle } from '@drizztdourden08/tessera/primitives';
import { ErrorBoundary } from '@drizztdourden08/tessera/composites';
import { OptionValueTag } from '@app/compounds/OptionValueTag';
import { RandomizerOptionGroup } from '@app/compounds/RandomizerOptionGroup';
import { POND_INSTANCES } from '@rotp/randomizer';
import { pondCeilingsOf } from '@rotp/randomizer';
import { PondInstanceRow } from './PondInstanceRow';
import type { PondId } from '@rotp/randomizer';
import type { PondSetting } from '@rotp/randomizer';
import { NO_FROZEN, NO_NOTES, NOTICE, POND_TABS, SHARE_LABEL } from './WishingPondSection.constants';
import type { WishingPondSectionProps } from './WishingPondSection.type';
import './WishingPondSection.css';

const WishingPondSection = (props: WishingPondSectionProps) => {
  const {
    profiles, capacity, share = false, demands, notes = NO_NOTES, readOnly = false,
    frozen = NO_FROZEN, onChange, onShareChange,
  } = props;
  const [tab, setTab] = useState<PondId>(POND_INSTANCES[0].id);
  const ceilings = useMemo(() => pondCeilingsOf(capacity), [capacity]);
  const pond = POND_INSTANCES.find((entry) => entry.id === tab) ?? POND_INSTANCES[0];
  const pondId = pond.id;
  const sources = useMemo(() => (share ? [] : POND_TABS.filter((entry) => entry.id !== pondId)), [share, pondId]);
  const handleShareChange = useCallback((next: boolean) => onShareChange?.(next), [onShareChange]);
  const handleTabChange = useCallback((id: string) => setTab(id as PondId), []);
  const changePond = useCallback((next: PondSetting) => onChange?.(pondId, next), [onChange, pondId]);
  const importPond = useCallback(
    (source: string) => onChange?.(pondId, profiles[source as PondId]),
    [onChange, pondId, profiles],
  );

  return (
    <ErrorBoundary label={NOTICE} resetKey={profiles}>
      <RandomizerOptionGroup title="Fairy ponds" live>
        <Box className="pond-section__head">
          {readOnly ? <OptionValueTag label={SHARE_LABEL} value={share} /> : (
            <Toggle
              checked={share}
              disabled={onShareChange === undefined}
              label={SHARE_LABEL}
              onChange={handleShareChange}
            />
          )}
          <Tabs tabs={POND_TABS} activeTab={pondId} onTabChange={handleTabChange} />
        </Box>
        <PondInstanceRow
          key={pondId}
          pond={pond}
          setting={profiles[pondId]}
          ceilings={ceilings}
          demands={demands}
          sources={sources}
          readOnly={readOnly || frozen.includes(pondId)}
          readout={readOnly}
          onChange={onChange === undefined ? undefined : changePond}
          onImport={onChange === undefined ? undefined : importPond}
        />
        {notes.map((note) => (
          <Text key={note} className="pond-row__note">{note}</Text>
        ))}
      </RandomizerOptionGroup>
    </ErrorBoundary>
  );
};

export { WishingPondSection };
export type { WishingPondSectionProps };
