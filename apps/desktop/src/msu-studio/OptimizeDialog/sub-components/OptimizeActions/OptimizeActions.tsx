/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Button } from '@drizztdourden08/tessera/primitives';
import type { OptimizeActionsProps } from './OptimizeActions.type';

const OptimizeActions = (props: OptimizeActionsProps) => {
  const { step, convertibleCount, convert, retry, onClose } = props;
  const t = useT();

  if (step === 'result') return <Button variant="primary" onClick={onClose}>{t('msu-studio:optimize.done')}</Button>;

  return (
    <>
      {step !== 'converting' && (
        <Button variant="tertiary" onClick={onClose}>{t('msu-studio:optimize.close')}</Button>
      )}
      {step === 'error' && (
        <Button variant="primary" onClick={() => { void retry(); }}>{t('msu-studio:optimize.retry')}</Button>
      )}
      {step === 'preview' && convertibleCount > 0 && (
        <Button variant="primary" onClick={() => { void convert(); }}>
          {t('msu-studio:optimize.convert', { count: convertibleCount })}
        </Button>
      )}
    </>
  );
};

export { OptimizeActions };
