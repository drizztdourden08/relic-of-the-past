/* @layer renderer-components @kind component */
/**
 * The wishing-pond section of an options panel: the row derived from the
 * setting (and, for a gamble, the seed its winning throws were drawn from),
 * inside an ErrorBoundary so a setting the model cannot plan shows an inline
 * notice instead of taking the whole options screen down. Shared by the
 * creation panel and the Run tab; the mode dropdown itself lives with the
 * player's other choices, under its own section.
 *
 * The setting is held to the wallet family of `capacity` before anything is
 * drawn (pond-wallet-top.ts): the range control stops at what the wallet can
 * hold, a stored range past it reads as the reach itself, and every edit
 * leaves already held, so what the row shows is what the seed is built from.
 * Each clamp is said in the blocking colour under the row.
 */
import { useMemo } from 'react';
import { Text } from '@ds/primitives';
import { ErrorBoundary } from '@ds/composites';
import { RandomizerOptionGroup } from '@domains/app/compounds/RandomizerOptionGroup';
import { WishingPondRow } from '@domains/app/compounds/WishingPondRow';
import { POND_PRICE_CEILING } from '@shared/randomizer/ap-world/pond/pond-profile-defaults';
import { holdPondToWallet, pondWalletTopOf } from '@shared/randomizer/ap-world/pond/pond-wallet-top';
import { pondRowModelOf, settingOfState } from '../../../../../../hooks/randomizer/pond-row-model';
import type { CapacityProfile } from '@shared/randomizer/ap-world/capacity/capacity-profile.type';
import type { PondSetting } from '@shared/randomizer/ap-world/pond/pond-profile.type';
import type { PondRowState } from '@domains/app/compounds/WishingPondRow';

interface WishingPondSectionProps {
  setting: PondSetting;
  /** The capacity profile the pond is paid from; absent reads as the vanilla wallet. */
  capacity?: CapacityProfile;
  /** The seed a gamble's winning throws are drawn from; '' before one exists. */
  seed?: string;
  /** Every fallback the setting reader applied. */
  notes?: readonly string[];
  readOnly?: boolean;
  onChange?: (next: PondSetting) => void;
}

const NOTICE = 'The wishing pond could not be planned from these settings.';

const WishingPondSection = (props: WishingPondSectionProps) => {
  const { setting, capacity, seed = '', notes = [], readOnly = false, onChange } = props;
  const walletTop = useMemo(
    () => (capacity === undefined ? POND_PRICE_CEILING : pondWalletTopOf(capacity)), [capacity],
  );
  const held = useMemo(() => holdPondToWallet(setting, walletTop), [setting, walletTop]);
  const model = useMemo(() => pondRowModelOf(held.setting, seed, walletTop), [held, seed, walletTop]);

  const handleChange = onChange === undefined
    ? undefined
    : (next: PondRowState) => onChange(holdPondToWallet(settingOfState(next), walletTop).setting);

  return (
    <ErrorBoundary label={NOTICE} resetKey={setting}>
      <RandomizerOptionGroup title="Wishing pond" live>
        <WishingPondRow model={model} readOnly={readOnly} onChange={handleChange} />
        {held.notes.map((note) => (
          <Text key={note} className="pond-row__note pond-row__note--held">{note}</Text>
        ))}
        {notes.map((note) => (
          <Text key={note} className="pond-row__note">{note}</Text>
        ))}
      </RandomizerOptionGroup>
    </ErrorBoundary>
  );
};

export { WishingPondSection };
export type { WishingPondSectionProps };
