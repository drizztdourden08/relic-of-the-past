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
 * The five rows every tooltip layer block shows — always present, always in
 * this order — sourced from ONE `TileClassification`
 * (@shared/game/navigation/tile-classification). This is the single shared
 * body every mode (single/dual/locked) renders, so the row list and order can
 * never diverge between them again.
 *
 * Each row's right-hand tag says where its value came from: `attr` is the raw
 * grid read; behavior/visual/collision are all keyed purely off that attr via
 * native tables; interactable is resolved from a live side-table and carries
 * its own family + slot tag (see classification-format.ts).
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
        value={interactable ? interactableText(interactable) : '—'}
        tag={interactable ? interactableTag(interactable) : undefined}
      />
    </>
  );
};

export { ClassificationRows };
