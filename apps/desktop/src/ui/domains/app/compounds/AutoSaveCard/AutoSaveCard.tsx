/* @layer renderer-components @kind component */
import { Button, IconButton, Image, Tag } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import type { AutoSaveCardProps } from './AutoSaveCard.type';
import './AutoSaveCard.css';

const formatTime = (timestamp: number): string => new Date(timestamp).toLocaleString(undefined, {
  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
});

const AutoSaveCard = (props: AutoSaveCardProps) => {
  const { id, timestamp, trigger, screenshotUrl, busy, onLoad, onDelete } = props;

  const actions = (
    <>
      <Button variant="tertiary" size="sm" onClick={() => onLoad(id)} disabled={busy} title="Load auto-save">
        Load
      </Button>
      <IconButton variant="danger" label="Delete auto-save" onClick={() => onDelete(id)} disabled={busy}>
        ✕
      </IconButton>
    </>
  );

  const badge = (
    <Tag variant="urgency" color={trigger === 'quit' ? 'warning' : 'info'}>
      {trigger === 'quit' ? 'On Quit' : 'Timer'}
    </Tag>
  );

  return (
    <ListItemRow
      className={busy ? 'auto-save-card auto-save-card--busy' : 'auto-save-card'}
      icon={<Image frame src={screenshotUrl ?? undefined} alt="Auto-save" className="auto-save-card__thumb" />}
      name={formatTime(timestamp)}
      columns={[{ primary: badge, align: 'end' }]}
      action={actions}
    />
  );
};

export { AutoSaveCard };
