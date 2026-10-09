/* @layer renderer-components @kind component */
import { Text, Button } from '@drizztdourden08/tessera/primitives';
import type { CatButtonProps } from './SpriteGrid.type';

const CatButton = (props: CatButtonProps) => {
  const { label, value, current, onClick, count } = props;
  return (
    <Button
      variant="bare"
      className={`sprite-manager__cat-btn ${current === value ? 'sprite-manager__cat-btn--active' : ''}`}
      onClick={() => onClick(value)}
    >
      {label} <Text className="sprite-manager__cat-count">{count}</Text>
    </Button>
  );
};

export { CatButton };
