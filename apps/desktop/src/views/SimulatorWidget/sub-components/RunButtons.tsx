/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Button } from '@drizztdourden08/tessera/primitives';
import type { RunButtonsProps } from '../SimulatorWidget.type';

const RunButtons = (props: RunButtonsProps) => {
  const { status, canRestore, onStart, onPause, onResume, onStop, onRestore } = props;
  const t = useT();
  const running = status === 'running';
  const paused = status === 'paused';
  const active = running || paused;

  return (
    <Box className="simulator__control-buttons">
      {!active && <Button size="sm" variant="primary" onClick={onStart}>{t('views-simulator:controls.start')}</Button>}
      {running && <Button size="sm" variant="secondary" onClick={onPause}>{t('views-simulator:controls.pause')}</Button>}
      {paused && <Button size="sm" variant="primary" onClick={onResume}>{t('views-simulator:controls.resume')}</Button>}
      {active && <Button size="sm" variant="danger" onClick={onStop}>{t('views-simulator:controls.stop')}</Button>}
      <Button size="sm" variant="tertiary" onClick={onRestore} disabled={!canRestore || active}>
        {t('views-simulator:controls.restore')}
      </Button>
    </Box>
  );
};

export { RunButtons };
