/* @layer renderer-components @kind component */
import { DialogShell } from '@drizztdourden08/tessera/composites';
import { useOptimize } from '../behavior/useOptimize';
import { OptimizeActions } from './sub-components/OptimizeActions';
import { OptimizeBody } from './sub-components/OptimizeBody';
import './OptimizeDialog.css';
import type { OptimizeDialogProps } from './OptimizeDialog.type';

const OptimizeDialog = (props: OptimizeDialogProps) => {
  const { open, pack, onClose, onConverted } = props;
  const optimize = useOptimize({ pack, open, onRunSettled: onConverted });
  const { step, tool, analysis, progress, result, error, convertibleCount } = optimize;

  const handleClose = (): void => { onClose(); };

  return (
    <DialogShell
      open={open}
      onClose={handleClose}
      dismissable={step !== 'converting'}
      title={`Optimize "${pack}"`}
      actions={(
        <OptimizeActions
          step={step}
          convertibleCount={convertibleCount}
          convert={optimize.convert}
          retry={optimize.retry}
          onClose={handleClose}
        />
      )}
      className="msu-optimize"
    >
      <OptimizeBody
        step={step}
        tool={tool}
        analysis={analysis}
        progress={progress}
        result={result}
        error={error}
        convertibleCount={convertibleCount}
      />
    </DialogShell>
  );
};

export { OptimizeDialog };
