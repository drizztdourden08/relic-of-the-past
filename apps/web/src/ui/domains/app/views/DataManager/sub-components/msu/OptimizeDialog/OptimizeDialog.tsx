/* @layer renderer-components @kind component */
/**
 * Normalising a pack to one audio format, as a dialog: get the tool, read the measured
 * numbers, convert.
 *
 * It converts and STOPS. The originals stay on disk, because a run that deleted as it went
 * would leave nothing to fall back to if the result was wrong — throwing the superseded halves
 * out is a separate, confirmed action on the pack's files.
 *
 * The run itself cannot be dismissed. It writes the manifest as it goes, and tearing the dialog
 * down mid-write would leave the pack half re-pointed with nothing watching it finish.
 */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import { DialogShell } from '@ds/composites/DialogShell';
import { useOptimize } from '../behavior/useOptimize';
import { InstallStep } from './sub-components/InstallStep';
import { PreviewStep } from './sub-components/PreviewStep';
import { RunStep } from './sub-components/RunStep';
import './OptimizeDialog.css';
import type { OptimizeDialogProps } from './OptimizeDialog.type';

const OptimizeDialog = (props: OptimizeDialogProps) => {
  const { open, pack, onClose, onConverted } = props;
  const optimize = useOptimize({ pack, open });
  const { step, tool, analysis, progress, result, error, convertibleCount } = optimize;

  // Every way out goes through here, the backdrop and Escape included: a run that converted
  // something has changed what is on disk, and leaving by the wrong door must not be the
  // difference between the files list knowing that and not.
  const handleClose = (): void => {
    if (result !== null && result.converted.length > 0) onConverted();
    onClose();
  };

  const body = (
    <>
      {step === 'tool' && (
        <InstallStep state={tool.state} installing={tool.installing} onInstall={() => { void tool.install(); }} />
      )}
      {step === 'checking' && <Text className="msu-optimize__note">Checking for the audio tool…</Text>}
      {step === 'measuring' && (
        <Box className="msu-optimize__step">
          <Text className="msu-optimize__note">
            {progress === null
              ? 'Measuring…'
              : `Measuring ${progress.fileName} — ${progress.index} of ${progress.total}`}
          </Text>
          <Text className="msu-optimize__note msu-optimize__note--faint">
            A short slice of every file is really encoded, so the estimate is measured rather than assumed.
          </Text>
        </Box>
      )}
      {step === 'preview' && analysis !== null && (
        <PreviewStep analysis={analysis} convertibleCount={convertibleCount} />
      )}
      {(step === 'converting' || step === 'result') && <RunStep progress={progress} result={result} />}
      {step === 'error' && error !== null && (
        <Text className="msu-optimize__note msu-optimize__note--bad">{error}</Text>
      )}
    </>
  );

  const actions = (
    <>
      {step === 'result' ? (
        <Button variant="primary" onClick={handleClose}>Done</Button>
      ) : (
        <>
          {step !== 'converting' && (
            <Button variant="tertiary" onClick={handleClose}>Close</Button>
          )}
          {step === 'error' && (
            <Button variant="primary" onClick={() => { void optimize.retry(); }}>Try again</Button>
          )}
          {step === 'preview' && convertibleCount > 0 && (
            <Button variant="primary" onClick={() => { void optimize.convert(); }}>
              Convert {convertibleCount} file{convertibleCount === 1 ? '' : 's'}
            </Button>
          )}
        </>
      )}
    </>
  );

  return (
    <DialogShell
      open={open}
      onClose={handleClose}
      dismissable={step !== 'converting'}
      title={`Optimize “${pack}”`}
      actions={actions}
      className="msu-optimize"
    >
      {body}
    </DialogShell>
  );
};

export { OptimizeDialog };
export type { OptimizeDialogProps };
