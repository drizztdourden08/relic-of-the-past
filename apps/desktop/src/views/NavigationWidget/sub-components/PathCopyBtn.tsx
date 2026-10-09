/* @layer renderer-widgets @kind component */
import { Button, Icon } from '@drizztdourden08/tessera/primitives';
import { useNavigationOverlayStore } from '../../../stores/navigation-overlay-store';

const PathCopyBtn = () => {
  const lockedPath = useNavigationOverlayStore(s => s.lockedPath);
  if (!lockedPath || lockedPath.length === 0) {
    return <Button variant="secondary" size="xs" icon={<Icon name="copy" />} disabled>Path</Button>;
  }
  return (
    <Button variant="secondary" size="xs" icon={<Icon name="copy" />} onClick={() => navigator.clipboard.writeText(lockedPath.map((t, i) => `${i}: [${t.row},${t.col}] 0x${t.attr.toString(16).padStart(2, '0')}`).join('\n'))}>
      Path ({lockedPath.length})
    </Button>
  );
};

export { PathCopyBtn };
