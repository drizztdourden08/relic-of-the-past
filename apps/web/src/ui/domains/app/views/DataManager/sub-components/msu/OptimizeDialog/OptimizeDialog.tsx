/* @layer renderer-components @kind component */
/**
 * Converts and STOPS: originals stay on disk as the fallback, and removing them is a separate
 * confirmed action. The run cannot be dismissed because it writes the manifest as it goes.
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
  // The pack is re-read the moment a run settles, not on the way out; see useOptimize.
  const optimize = useOptimize({ pack, open, onRunSettled: onConverted });
  const { step, tool, analysis, progress, result, error, convertibleCount } = optimize;

  const handleClose = (): void => { onClose(); };

  const body = (
    <>
      {step === 'tool' && (
        <InstallStep state={tool.state} installing={tool.installing} onInstall={() => { void tool.install(); }} />
      )}
      {step === 'checking' && <Text className="msu-optimize__note">Checking for the audio tool...</Text>}
      {step === 'measuring' && (
        <Box className="msu-optimize__step">
          <Text className="msu-optimize__note">
            {progress === null
              ? 'Measuring...'
              : `Measuring ${progress.fileName} (${progress.index} of ${progress.total})`}
          </Text>
          <Text className="msu-optimize__note msu-optimize__note--faint">
            A short slice of every file is really encoded, so the estimate is measured, not assumed.
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
      title={`Optimize "${pack}"`}
      actions={actions}
      className="msu-optimize"
    >
      {body}
    </DialogShell>
  );
};

export { OptimizeDialog };
export type { OptimizeDialogProps };
