/* @layer renderer-components @kind component */
import { Thumbnail } from '../../../../design-system/primitives/Thumbnail';
import { Text } from '../../../../design-system/primitives/Text';
import { Button } from '../../../../design-system/primitives/Button';
import { SaveCard } from '../SaveCard';
import type { HeroSaveCardProps } from './HeroSaveCard.type';
import './HeroSaveCard.css';

const HeroSaveCard = (props: HeroSaveCardProps) => {
  const { name, timestamp, screenshotUrl, onLoad, busy } = props;

  const thumb = (
    <Thumbnail
      src={screenshotUrl}
      alt={name}
      className="hero-save-card__thumb"
      placeholder={<Text className="hero-save-card__no-screenshot">No Screenshot</Text>}
    />
  );

  return (
    <SaveCard variant="feature" busy={busy} thumb={thumb}>
      <Text className="hero-save-card__label">Last Save</Text>
      <Text className="hero-save-card__name">{name}</Text>
      <Text className="hero-save-card__time">
        {new Date(timestamp).toLocaleString(undefined, {
          weekday: 'short', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })}
      </Text>
      <Button variant="secondary" size="sm" className="hero-save-card__load-btn" onClick={onLoad} disabled={busy}>
        Load Save
      </Button>
    </SaveCard>
  );
};

export { HeroSaveCard };
