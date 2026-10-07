/* @layer renderer-components @kind component */
import type { ReactNode } from 'react';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import type { TileClassification } from '@shared/game/navigation/tile-classification';
import { S } from './styles';
import { collisionText, collisionColor, interactableText, interactableTag } from './classification-format';

interface ClassificationRowsProps {
  attr: number;
  classification: TileClassification;
  canPass: boolean | null;
}

interface RowProps {
  label: string;
  value: ReactNode;
  tag?: string;
  color?: string;
}

const Row = ({ label, value, tag, color }: RowProps) => (
  <Box style={S.classRow}>
    <Text style={S.classLabel}>{label}</Text>
    <Text style={color ? { color } : S.text}>{value}</Text>
    {tag && <Text style={S.classTag}>{tag}</Text>}
  </Box>
);

/**
 * The five rows every layer block shows, from ONE `TileClassification`, so modes cannot diverge.
 * Each row's tag says where its value came from: the grid, the attr, or a live side-table.
 */
const ClassificationRows = ({ attr, classification, canPass }: ClassificationRowsProps) => {
  const { behavior, visual, collision, interactable } = classification;
  return (
    <>
      <Row label="attr" value={`0x${attr.toString(16).padStart(2, '0')}`} tag="grid" />
      <Row label="behavior" value={behavior} tag="attr" />
      <Row label="visual" value={visual.replace(/-/g, ' ')} tag="attr" />
      <Row
        label="collision"
        value={collisionText(collision)}
        tag="attr"
        color={collisionColor(collision, canPass)}
      />
      <Row
        label="interactable"
        value={interactable ? interactableText(interactable) : '-'}
        tag={interactable ? interactableTag(interactable) : undefined}
      />
    </>
  );
};

export { ClassificationRows };
