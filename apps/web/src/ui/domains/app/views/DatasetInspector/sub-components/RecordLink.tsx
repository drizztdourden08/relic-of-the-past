/* @layer renderer-app @kind component */
import { Button, Text } from '@ds/primitives';
import './RecordLink.css';

interface RecordLinkProps {
  id?: string;
  label?: string;
  onNavigate: (id: string) => void;
}

/** A record id, rendered as a jump-to link — the one piece that makes the dataset a graph instead of a list. */
const RecordLink = (props: RecordLinkProps) => {
  const { id, label, onNavigate } = props;

  if (!id) {
    return <Text className="record-link record-link--empty">—</Text>;
  }

  return (
    <Button variant="bare" className="record-link" title={id} onClick={() => onNavigate(id)}>
      {label ?? id}
    </Button>
  );
};

export { RecordLink };
export type { RecordLinkProps };
