/* @layer renderer-components @kind data */
import { Thumbnail } from '../../../../design-system/primitives/Thumbnail';
import { Text } from '../../../../design-system/primitives/Text';
import { Flex } from '../../../../design-system/primitives/Flex';
import { Button } from '../../../../design-system/primitives/Button';
import { IconButton } from '../../../../design-system/primitives/IconButton';
import { SaveCard } from '../SaveCard';
import type { AutoSaveCardProps } from './AutoSaveCard.type';
import './AutoSaveCard.css';

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

  return (
    <SaveCard
      variant="row"
      busy={busy}
      thumb={<Thumbnail src={screenshotUrl} alt="Auto-save" className="auto-save-card__thumb" />}
      actions={actions}
    >
      <Flex align="center" gap="sm">
        <Text className="auto-save-card__time">
          {new Date(timestamp).toLocaleString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
          })}
        </Text>
        <Text className={`auto-save-card__badge auto-save-card__badge--${trigger}`}>
          {trigger === 'quit' ? 'On Quit' : 'Timer'}
        </Text>
      </Flex>
    </SaveCard>
  );
};

export { AutoSaveCard };
