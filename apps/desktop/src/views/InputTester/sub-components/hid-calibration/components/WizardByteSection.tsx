/* @layer renderer-components @kind component */
import { ByteGrid } from './ByteGrid';
import { RawAvailabilityNotice } from './RawAvailabilityNotice';
import type { WizardSectionProps } from './WizardSection.type';

const WizardByteSection = (props: WizardSectionProps) => {
  const { wiz } = props;

  if (!wiz.rawAvailable) return <RawAvailabilityNotice available={false} reason={wiz.rawUnavailableReason} />;

  return (
    <ByteGrid
      latestBytes={wiz.latestBytes}
      byteStatuses={wiz.byteStatuses}
      gyroState={wiz.gyroState}
      stickPickMode={wiz.stickPickMode}
      stickPickedBytes={wiz.stickPickedBytes}
      triggerPickMode={wiz.triggerPickMode}
      triggerPickedByte={wiz.triggerPickedByte}
      inputPhaseActive={wiz.inputPhaseActive}
      lastReportId={wiz.lastReportId}
      baselineRef={wiz.baselineRef}
      excludedRef={wiz.excludedRef}
      itemsRef={wiz.itemsRef}
      activeIdxRef={wiz.activeIdxRef}
      inputPhaseActiveRef={wiz.inputPhaseActiveRef}
      getByteColorKey={wiz.getByteColorKey}
      onByteClick={wiz.handleByteClick}
    />
  );
};

export { WizardByteSection };
