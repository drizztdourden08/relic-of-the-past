/* @layer renderer-components @kind component */
import { Button, Icon } from '@drizztdourden08/tessera/primitives';
import type { CreateListPaneProps } from './CreateListPane.type';

const CreateListPane = (props: CreateListPaneProps) => {
  const { label, creating, onCreate, available = true, notice, children } = props;

  return (
    <>
      {notice}
      {available && (
        <Button variant="primary" fullWidth icon={<Icon name="plus" />} disabled={creating} onClick={onCreate}>
          {label}
        </Button>
      )}
      {children}
    </>
  );
};

export { CreateListPane };
