/* @layer renderer-components @kind component */
/**
 * The fairy-pond section of an options panel: the switch that puts all three
 * ponds on one set of settings, a tab per pond under it, and the tab's own
 * pond drawn in the block every pond shares. Wrapped in an ErrorBoundary so a
 * setting the model cannot plan shows an inline notice instead of taking the
 * whole options screen down. Shared by the creation panel and the Run tab; the
 * mode dropdowns themselves live with the player's other choices, under their
 * own section.
 *
 * Tabs, not three stacked blocks: the three ponds are set the same way and
 * only one is worked on at a time, so stacking them cost three screenfuls of
 * scrolling to reach the last.
 *
 * Every setting is held to the wallet family of `capacity` before anything is
 * drawn (pond-wallet-top.ts): a range control stops at what the wallet can
 * hold, a stored range past it reads as the reach itself, and every edit
 * leaves already held, so what a row shows is what the seed is built from.
 * Each clamp is said in the blocking colour under its own row.
 */
import { useMemo, useState } from 'react';
import { Box, TabBar, Text, Toggle } from '@ds/primitives';
import { ErrorBoundary } from '@ds/composites';
import { RandomizerOptionGroup } from '@domains/app/compounds/RandomizerOptionGroup';
import { POND_INSTANCES } from '@shared/randomizer/ap-world/pond/pond-instances.data';
import { pondCeilingsOf } from '@shared/randomizer/ap-world/pond/pond-ceilings';
import { PondInstanceRow } from './PondInstanceRow';
import type { CapacityProfile } from '@shared/randomizer/ap-world/capacity/capacity-profile.type';
import type { PondDemandView } from '@shared/randomizer/ap-world/pond/pond-ask.type';
import type { PondId } from '@shared/randomizer/ap-world/pond/pond-instance.type';
import type { PondSetting } from '@shared/randomizer/ap-world/pond/pond-profile.type';
import type { PondProfiles } from '@shared/randomizer/ap-world/pond/pond-profiles.type';
import './WishingPondSection.css';

interface WishingPondSectionProps {
  profiles: PondProfiles;
  /** The capacity profile the ponds are paid from; absent reads as the vanilla wallet. */
  capacity?: CapacityProfile;
  /** One set of settings across all three ponds. */
  share?: boolean;
  /** What this seed's ponds ask for at each rung; none previews the plain prices. */
  demands?: PondDemandView;
  /** Every fallback the setting reader applied, each naming its own pond. */
  notes?: readonly string[];
  /** Every pond frozen: the Run tab, which shows a seed already rolled. */
  readOnly?: boolean;
  /** The ponds a sibling rule took out of the player's hands, on top of readOnly. */
  frozen?: readonly PondId[];
  onChange?: (id: PondId, next: PondSetting) => void;
  onShareChange?: (next: boolean) => void;
}

const NOTICE = 'The fairy ponds could not be planned from these settings.';

const SHARE_LABEL = 'One set of settings for all three ponds';

const NO_FROZEN: readonly PondId[] = [];

const TABS = POND_INSTANCES.map((pond) => ({ id: pond.id, label: pond.label }));

const WishingPondSection = (props: WishingPondSectionProps) => {
  const {
    profiles, capacity, share = false, demands, notes = [], readOnly = false,
    frozen = NO_FROZEN, onChange, onShareChange,
  } = props;
  const [tab, setTab] = useState<PondId>(POND_INSTANCES[0].id);
  const ceilings = useMemo(() => pondCeilingsOf(capacity), [capacity]);
  const pond = POND_INSTANCES.find((entry) => entry.id === tab) ?? POND_INSTANCES[0];
  // While one set is in force every tab shows the same thing, so copying from
  // another of them would do nothing.
  const sources = share ? [] : TABS.filter((entry) => entry.id !== pond.id);

  return (
    <ErrorBoundary label={NOTICE} resetKey={profiles}>
      <RandomizerOptionGroup title="Fairy ponds" live>
        <Box className="pond-section__head">
          <Toggle
            checked={share}
            disabled={readOnly || onShareChange === undefined}
            label={SHARE_LABEL}
            onChange={(next) => onShareChange?.(next)}
          />
          <TabBar tabs={TABS} activeTab={pond.id} onTabChange={(id) => setTab(id as PondId)} />
        </Box>
        <PondInstanceRow
          key={pond.id}
          pond={pond}
          setting={profiles[pond.id]}
          ceilings={ceilings}
          demands={demands}
          sources={sources}
          readOnly={readOnly || frozen.includes(pond.id)}
          onChange={onChange === undefined ? undefined : (next) => onChange(pond.id, next)}
          onImport={onChange === undefined
            ? undefined
            : (source) => onChange(pond.id, profiles[source as PondId])}
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
