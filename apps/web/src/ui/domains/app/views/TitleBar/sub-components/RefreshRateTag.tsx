/* @layer renderer-components @kind component */
import { Status, Text } from '@drizztdourden08/tessera/primitives';
import type { RefreshRateTagProps } from '../TitleBar.type';
import './RefreshRateTag.css';

const RefreshRateTag = (props: RefreshRateTagProps) => {
  const { onClick } = props;
  return (
    <Text
      className="refresh-rate-tag"
      role="button"
      tabIndex={0}
      title="This display's refresh rate is not a multiple of 60, so the game cannot be shown evenly. Click to open display settings."
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
    >
      <Status tone="danger">⚠ incompatible refresh rate ⚠</Status>
    </Text>
  );
};

export { RefreshRateTag };
