/* @layer renderer-components @kind component */
/**
 * One applied value. It is a Badge with a surface treatment and a remove
 * button, rather than a chip built from scratch, so it stays in the same visual
 * family as every other small label in the library.
 */
import { Badge } from '../../Badge';
import { IconButton } from '../../IconButton';
import type { TagChipProps } from '../TagInput.type';

const TagChip = (props: TagChipProps) => {
  const { tag, advice, disabled, onRemove } = props;

  const cls = `tag-input__chip${advice.ok ? '' : ' tag-input__chip--off-convention'}`;

  return (
    <Badge variant="neutral" className={cls}>
      <span className="tag-input__chip-text" title={advice.message ?? undefined}>
        {tag}
      </span>
      <IconButton
        className="tag-input__chip-remove"
        variant="ghost"
        size="sm"
        type="button"
        label={`Remove ${tag}`}
        disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={onRemove}
      >
        ×
      </IconButton>
    </Badge>
  );
};

export { TagChip };
