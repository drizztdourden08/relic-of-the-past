/* @layer renderer-components @kind component */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import { Spinner } from '../../../../../../design-system/primitives/Spinner';
import { ProgressBar } from '../../../../../../design-system/primitives/ProgressBar';
import type { ImportProgressState } from '@app/hooks/useImportProgress';
import './ImportProgress.css';

interface ImportProgressProps {
  state: ImportProgressState;
  /** Shown before the first progress event arrives (e.g. the form's "Downloading…"). */
  fallbackLabel?: string;
}

const ImportProgress = (props: ImportProgressProps) => {
  const { state, fallbackLabel } = props;
  const label = state.label || fallbackLabel || 'Working…';
  const percent = state.percent;

  return (
    <Box className="import-progress">
      {percent != null ? (
        <>
          <ProgressBar value={percent} />
          <Text className="import-progress__label">{label} — {Math.round(percent)}%</Text>
        </>
      ) : (
        <Box className="import-progress__row">
          <Spinner size="sm" />
          <Text className="import-progress__label">{label}</Text>
        </Box>
      )}
    </Box>
  );
};

export { ImportProgress };
export type { ImportProgressProps };
