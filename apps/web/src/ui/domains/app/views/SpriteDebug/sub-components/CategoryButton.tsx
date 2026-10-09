/* @layer renderer-components @kind component */
import { Button, Text } from '@drizztdourden08/tessera/primitives';
import { LABEL_STYLES, S } from '../SpriteDebug.constants';

const CategoryButton = ({ label, value, current, onClick, count }: {
  label: string; value: string; current: string; onClick: (v: string) => void; count: number;
}) => {
  const active = current === value;
  return (
    <Button variant="bare" onClick={() => onClick(value)} style={{ ...S.catTab, ...(active ? S.catTabActive : {}) }}>
      {label} <Text style={LABEL_STYLES.count}>({count})</Text>
    </Button>
  );
};

export { CategoryButton };
