/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { ImportProgress } from '../../ImportProgress';
import type { ImportStatusLineProps } from '../ImportForm.type';

const ImportStatusLine = (props: ImportStatusLineProps) => {
  const { busy, progress, status } = props;
  const statusClass = status.variant ? `import-form__status import-form__status--${status.variant}` : 'import-form__status';

  if (busy) return <ImportProgress state={progress} fallbackLabel={status.message || undefined} />;
  if (!status.message) return null;
  return <Box className={statusClass}>{status.message}</Box>;
};

export { ImportStatusLine };
