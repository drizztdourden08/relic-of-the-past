/* @layer renderer-components @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { Button } from '@drizztdourden08/tessera/primitives';
import { ErrorBoundary } from '@drizztdourden08/tessera/composites';
import { CapacityUpgradesRows } from './sub-components/CapacityUpgradesRows';
import { NOTICE } from './CapacityUpgradesSection.constants';
import type { CapacityUpgradesSectionProps } from './CapacityUpgradesSection.type';

const CapacityUpgradesSection = (props: CapacityUpgradesSectionProps) => {
  const {
    profile, fillerHeadroom, notes, enabled, progressive, forced, walletFloor, bonus, readOnly = false,
    onChange, onBonusChange, onEnabledChange, onProgressiveChange, onReset,
  } = props;
  const t = useT();
  const text = useText();
  const action = onReset === undefined
    ? undefined
    : <Button variant="secondary" size="sm" onClick={onReset}>{t('views-randomizer:capacity.reset')}</Button>;

  return (
    <ErrorBoundary label={text(NOTICE)} action={action} resetKey={profile}>
      <CapacityUpgradesRows
        profile={profile}
        fillerHeadroom={fillerHeadroom}
        notes={notes}
        enabled={enabled}
        progressive={progressive}
        forced={forced}
        walletFloor={walletFloor}
        bonus={bonus}
        readOnly={readOnly}
        onChange={onChange}
        onBonusChange={onBonusChange}
        onEnabledChange={onEnabledChange}
        onProgressiveChange={onProgressiveChange}
      />
    </ErrorBoundary>
  );
};

export { CapacityUpgradesSection };
