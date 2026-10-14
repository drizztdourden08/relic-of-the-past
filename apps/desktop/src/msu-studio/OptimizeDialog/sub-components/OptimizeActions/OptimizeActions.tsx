/* @layer renderer-components @kind component */
import { Button } from '@drizztdourden08/tessera/primitives';
import type { OptimizeActionsProps } from './OptimizeActions.type';

const OptimizeActions = (props: OptimizeActionsProps) => {
  const { step, convertibleCount, convert, retry, onClose } = props;

  if (step === 'result') return <Button variant="primary" onClick={onClose}>Done</Button>;

  return (
    <>
      {step !== 'converting' && (
        <Button variant="tertiary" onClick={onClose}>Close</Button>
      )}
      {step === 'error' && (
        <Button variant="primary" onClick={() => { void retry(); }}>Try again</Button>
      )}
      {step === 'preview' && convertibleCount > 0 && (
        <Button variant="primary" onClick={() => { void convert(); }}>
          Convert {convertibleCount} file{convertibleCount === 1 ? '' : 's'}
        </Button>
      )}
    </>
  );
};

export { OptimizeActions };
