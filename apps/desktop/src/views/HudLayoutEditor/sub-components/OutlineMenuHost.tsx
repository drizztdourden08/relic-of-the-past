/* @layer renderer-components @kind component */
import { OutlineRowMenu } from './OutlineRowMenu';
import type { OutlineMenuHostProps } from './OutlineMenuHost.type';

const OutlineMenuHost = (props: OutlineMenuHostProps) => {
  const { doc, menuId, anchor, onStep, onRemove, onClose } = props;
  if (!menuId) return null;

  return (
    <OutlineRowMenu
      doc={doc}
      id={menuId}
      anchorRef={{ current: anchor }}
      removable
      onStep={(direction) => onStep(menuId, direction)}
      onRemove={() => onRemove(menuId)}
      onClose={onClose}
    />
  );
};

export { OutlineMenuHost };
