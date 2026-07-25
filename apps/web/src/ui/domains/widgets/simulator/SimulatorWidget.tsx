/* @layer renderer-widgets @kind component */
/**
 * SimulatorWidgetContent — the view-tier host for the gameplay simulator. Owns
 * the runner and dataset-apply hooks and composes the run controls, live
 * progress, narrative feed and finished-run results.
 */
import { Box } from '@ds/primitives';
import { useSimulatorStore } from '@app/stores/simulator-store';
import { useSimulatorRun } from './behavior/useSimulatorRun';
import { useDatasetSuggestions } from './behavior/useDatasetSuggestions';
import { RunControls } from './sub-components/RunControls';
import { ProgressSummary } from './sub-components/ProgressSummary';
import { EventLog } from './sub-components/EventLog';
import { ResultsPanel } from './sub-components/ResultsPanel';
import './SimulatorWidget.css';

const SimulatorWidgetContent = () => {
  const run = useSimulatorRun();
  const { apply, canApplyCheck } = useDatasetSuggestions();

  const status = useSimulatorStore((s) => s.status);
  const phaseLabel = useSimulatorStore((s) => s.phaseLabel);
  const progress = useSimulatorStore((s) => s.progress);
  const events = useSimulatorStore((s) => s.events);
  const outcome = useSimulatorStore((s) => s.outcome);
  const suggestions = useSimulatorStore((s) => s.suggestions);
  const softlockReport = useSimulatorStore((s) => s.softlockReport);

  return (
    <Box className="simulator">
      <RunControls
        status={status}
        stopAtCheckId={run.stopAtCheckId}
        onStopAtChange={run.setStopAtCheckId}
        screenLimit={run.screenLimit}
        onScreenLimitChange={run.setScreenLimit}
        canRestore={run.canRestore}
        onStart={run.start}
        onPause={run.pause}
        onResume={run.resume}
        onStop={run.stop}
        onRestore={run.restore}
      />
      <ProgressSummary status={status} phaseLabel={phaseLabel} progress={progress} />
      <EventLog events={events} />
      <ResultsPanel
        outcome={outcome}
        stopAtCheckId={run.stopAtCheckId}
        softlockReport={softlockReport}
        suggestions={suggestions}
        canApplyCheck={canApplyCheck}
        onOpenLog={run.openLog}
        onApply={apply}
      />
    </Box>
  );
};

export { SimulatorWidgetContent };
