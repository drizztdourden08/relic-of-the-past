/* @layer renderer-components @kind component */
/**
 * The live value in brackets, beside a field whose live reading disagrees
 * with the dataset — `260 [0x0104]`. The dataset value is whatever the
 * field's own kit already rendered, untouched; this is only the live half,
 * coloured so a scan finds the row without reading its label. The title
 * names the source table (e.g. `native:room-identity`), so hovering answers
 * "which table said so" without opening the comparison pane.
 */
import { Text } from '../../../primitives/Text';
import type { FieldDifference } from '../CompactRecordView.type';
import '../CompactRecordView.css';

interface DiffBracketProps {
  difference: FieldDifference;
}

const DiffBracket = (props: DiffBracketProps) => {
  const { difference } = props;
  const { shown, source } = difference;

  return (
    <Text as="span" className="compact-record-view__diff" title={`live (${source}): ${shown.live}`}>
      {' '}[{shown.live}]
    </Text>
  );
};

export { DiffBracket };
