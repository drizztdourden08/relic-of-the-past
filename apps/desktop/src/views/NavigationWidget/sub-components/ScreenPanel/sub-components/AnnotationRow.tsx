/* @layer renderer-widgets @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { ANNOTATION_STYLES } from '@app/navigation-overlay/annotation-style';
import { annotationStateClass } from '../behavior/annotation-state-class';
import type { AnnotationRowProps } from './AnnotationRow.type';

const AnnotationRow = ({ item, tone, off, onToggle }: AnnotationRowProps) => {
  const style = ANNOTATION_STYLES[item.kind];
  const settled = item.state === 'open' || item.state === 'done';
  return (
    <Box
      className={off ? 'nav-screen-panel__row nav-screen-panel__row--off' : 'nav-screen-panel__row'}
      onClick={() => onToggle(item.kind)}
      title={`${item.kind} at r${item.tile.row} c${item.tile.col}${item.layer !== undefined ? ` L${item.layer}` : ''}. Click to ${off ? 'show' : 'hide'}`}
    >
      <Text data-tone={tone} className={settled ? 'nav-screen-panel__glyph nav-screen-panel__glyph--settled' : 'nav-screen-panel__glyph'}>{style.glyph}</Text>
      <Text className={settled ? 'nav-screen-panel__label nav-screen-panel__label--settled' : 'nav-screen-panel__label'}>{item.label}</Text>
      {item.detail && <Text className="nav-screen-panel__detail">{item.detail}</Text>}
      {item.state && (
        <Text className={annotationStateClass(item.state, settled)}>
          {item.state === 'blocked' ? 'unreachable' : item.state}
        </Text>
      )}
    </Box>
  );
};

export { AnnotationRow };
