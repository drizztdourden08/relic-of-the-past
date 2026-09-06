/* @layer renderer-components @kind component */
/**
 * The capacity-upgrades section of an options panel, fenced: the rows are
 * derived and rendered inside an ErrorBoundary, so a profile the model
 * cannot plan shows an inline notice (with a reset where the panel is
 * editable) instead of taking the whole options screen down. The fence
 * re-tries on every profile change. Shared by the creation panel and the
 * Run tab.
 */
import { Button } from '@ds/primitives';
import { ErrorBoundary } from '@ds/composites';
import { CapacityUpgradesRows } from './CapacityUpgradesRows';
import type { CapacityUpgradesSectionProps } from './CapacityUpgradesSection.type';

const NOTICE = 'The capacity upgrades could not be planned from these settings.';

const CapacityUpgradesSection = (props: CapacityUpgradesSectionProps) => {
  const {
    profile, fillerHeadroom, notes, enabled, progressive, forced, walletFloor, bonus, readOnly = false,
    onChange, onBonusChange, onEnabledChange, onProgressiveChange, onReset,
  } = props;
  const action = onReset === undefined
    ? undefined
    : <Button variant="secondary" size="sm" onClick={onReset}>Reset capacity settings</Button>;

  return (
    <ErrorBoundary label={NOTICE} action={action} resetKey={profile}>
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
