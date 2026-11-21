/* @layer renderer-widgets @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { ANNOTATION_STYLES } from '@app/navigation-overlay/annotation-style';
import { annotationRowClasses } from '../behavior/annotation-row-classes';
import { annotationRowDetail } from '../behavior/annotation-row-detail';
import { annotationRowTitle } from '../behavior/annotation-row-title';
import { annotationStateClass } from '../behavior/annotation-state-class';
import { STATE_TEXT } from '../ScreenPanel.constants';
import type { AnnotationRowProps } from './AnnotationRow.type';

const AnnotationRow = ({ item, tone, off, onToggle }: AnnotationRowProps) => {
  const t = useT();
  const text = useText();
  const style = ANNOTATION_STYLES[item.kind];
  const classes = annotationRowClasses(item.state, off);
  const detail = annotationRowDetail(t, text, item);
  return (
    <Box
      className={classes.row}
      onClick={() => onToggle(item.kind)}
      title={annotationRowTitle(t, item, off)}
    >
      <Text data-tone={tone} className={classes.glyph}>{style.glyph}</Text>
      <Text className={classes.label}>{text(item.label)}</Text>
      {detail !== '' && <Text className="nav-screen-panel__detail">{detail}</Text>}
      {item.state && (
        <Text className={annotationStateClass(item.state, classes.settled)}>
          {text(STATE_TEXT[item.state])}
        </Text>
      )}
    </Box>
  );
};

export { AnnotationRow };
