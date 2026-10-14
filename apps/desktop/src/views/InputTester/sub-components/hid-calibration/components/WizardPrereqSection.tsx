/* @layer renderer-components @kind component */
import { PrereqCards } from './PrereqCards';
import type { WizardSectionProps } from './WizardSection.type';

const WizardPrereqSection = (props: WizardSectionProps) => {
  const { wiz } = props;

  return (
    <PrereqCards
      hasGyro={wiz.hasGyro}
      gyroState={wiz.gyroState}
      idleState={wiz.idleState}
      gyroExcluded={wiz.gyroExcluded}
      latestBytesLength={wiz.latestBytes.length}
      onGyroStart={wiz.handleGyroStart}
      onGyroStop={wiz.handleGyroStop}
      onGyroRedo={wiz.handleGyroRedo}
      onGyroSkip={wiz.handleGyroSkip}
      onIdleCapture={wiz.handleIdleCapture}
      onIdleRedo={wiz.handleIdleRedo}
    />
  );
};

export { WizardPrereqSection };
