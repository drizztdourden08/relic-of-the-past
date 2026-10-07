/* @layer renderer-components @kind component */
/**
 * Flags a display refresh rate the game cannot be shown evenly on.
 *
 * Sits next to the FPS readout because that is where someone looks when the motion feels wrong,
 * and clicking it goes straight to the setting that fixes it. The symptom is baffling on its
 * own, so the tag has to lead somewhere.
 */
import { Badge } from '../../../../../design-system/primitives/Badge';
import { Text } from '../../../../../design-system/primitives/Text';
import './RefreshRateTag.css';

interface RefreshRateTagProps {
  /** Opens the Display settings, where the refresh-rate options live. */
  onClick: () => void;
}

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
      <Badge variant="danger">⚠ incompatible refresh rate ⚠</Badge>
    </Text>
  );
};

export { RefreshRateTag };
export type { RefreshRateTagProps };
