/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { FfmpegInstallStep } from '@app/compounds/FfmpegInstallStep';
import { MeasuringStep } from '../MeasuringStep';
import { PreviewStep } from '../PreviewStep';
import { RunStep } from '../RunStep';
import type { OptimizeBodyProps } from './OptimizeBody.type';

const OptimizeBody = (props: OptimizeBodyProps) => {
  const { step, tool, analysis, progress, result, error, convertibleCount } = props;
  return (
    <>
      {step === 'tool' && (
        <FfmpegInstallStep
          state={tool.state}
          installing={tool.installing}
          error={tool.error}
          onInstall={() => { void tool.install(); }}
        />
      )}
      {step === 'checking' && <Text className="msu-optimize__note">Checking for the audio tool...</Text>}
      {step === 'measuring' && <MeasuringStep progress={progress} />}
      {step === 'preview' && analysis !== null && (
        <PreviewStep analysis={analysis} convertibleCount={convertibleCount} />
      )}
      {(step === 'converting' || step === 'result') && <RunStep progress={progress} result={result} />}
      {step === 'error' && error !== null && (
        <Text className="msu-optimize__note msu-optimize__note--bad">{error}</Text>
      )}
    </>
  );
};

export { OptimizeBody };
