/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { collisionText, collisionTone, interactableText, interactableTag } from '@app/navigation-overlay/classification-format';
import { ClassificationRow } from './ClassificationRow';
import type { ClassificationRowsProps } from './ClassificationRows.type';

const ClassificationRows = ({ attr, classification, canPass }: ClassificationRowsProps) => {
  const t = useT();
  const { behavior, visual, collision, interactable } = classification;
  return (
    <>
      <ClassificationRow label={t('views-game-layer:class.attr')} value={`0x${attr.toString(16).padStart(2, '0')}`} tag="grid" />
      <ClassificationRow label={t('views-game-layer:class.behavior')} value={behavior} tag="attr" />
      <ClassificationRow label={t('views-game-layer:class.visual')} value={visual.replace(/-/g, ' ')} tag="attr" />
      <ClassificationRow
        label={t('views-game-layer:class.collision')}
        value={collisionText(collision)}
        tag="attr"
        tone={collisionTone(collision, canPass)}
      />
      <ClassificationRow
        label={t('views-game-layer:class.interactable')}
        value={interactable ? interactableText(interactable) : '-'}
        tag={interactable ? interactableTag(interactable) : undefined}
      />
    </>
  );
};

export { ClassificationRows };
