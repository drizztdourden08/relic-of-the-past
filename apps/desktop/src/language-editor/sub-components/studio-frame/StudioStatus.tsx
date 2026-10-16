/* @layer renderer-components @kind component */
import { Status } from '@drizztdourden08/tessera/primitives';
import { SaveStatusBadge } from '../SaveStatusBadge';
import type { StudioStatusProps } from './studio-frame.type';

const StudioStatus = (props: StudioStatusProps) => {
  const { origin, warnings, ...save } = props;

  return (
    <>
      <Status tone="neutral">{origin === 'rom' ? 'from ROM' : 'custom'}</Status>
      {warnings > 0 && (
        <Status tone="warning">{`${warnings} ${warnings === 1 ? 'line needs' : 'lines need'} attention`}</Status>
      )}
      <SaveStatusBadge {...save} />
    </>
  );
};

export { StudioStatus };
