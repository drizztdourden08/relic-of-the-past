/* @layer renderer-components @kind component */
import { collisionText, collisionColor, interactableText, interactableTag } from './classification-format';
import { ClassificationRow } from './sub-components/ClassificationRow';
import type { ClassificationRowsProps } from './classification-rows.type';

const ClassificationRows = ({ attr, classification, canPass }: ClassificationRowsProps) => {
  const { behavior, visual, collision, interactable } = classification;
  return (
    <>
      <ClassificationRow label="attr" value={`0x${attr.toString(16).padStart(2, '0')}`} tag="grid" />
      <ClassificationRow label="behavior" value={behavior} tag="attr" />
      <ClassificationRow label="visual" value={visual.replace(/-/g, ' ')} tag="attr" />
      <ClassificationRow
        label="collision"
        value={collisionText(collision)}
        tag="attr"
        color={collisionColor(collision, canPass)}
      />
      <ClassificationRow
        label="interactable"
        value={interactable ? interactableText(interactable) : '-'}
        tag={interactable ? interactableTag(interactable) : undefined}
      />
    </>
  );
};

export { ClassificationRows };
