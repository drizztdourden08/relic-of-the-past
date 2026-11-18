/* @layer renderer-widgets @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { ANNOTATION_STYLES } from '@app/navigation-overlay/annotation-style';
import { annotationStateClass } from '../behavior/annotation-state-class';
import { STATE_TEXT } from '../ScreenPanel.constants';
import type { AnnotationRowProps } from './AnnotationRow.type';

const AnnotationRow = ({ item, tone, off, onToggle }: AnnotationRowProps) => {
  const t = useT();
  const text = useText();
  const style = ANNOTATION_STYLES[item.kind];
  const settled = item.state === 'open' || item.state === 'done';
  return (
    <Box
      className={off ? 'nav-screen-panel__row nav-screen-panel__row--off' : 'nav-screen-panel__row'}
      onClick={() => onToggle(item.kind)}
      title={item.layer !== undefined ? t('views-navigation:annotation.row.layer', { kind: item.kind, row: item.tile.row, col: item.tile.col, layer: item.layer, off: off ? 'yes' : 'no' }) : t('views-navigation:annotation.row.title', { kind: item.kind, row: item.tile.row, col: item.tile.col, off: off ? 'yes' : 'no' })}
    >
      <Text data-tone={tone} className={settled ? 'nav-screen-panel__glyph nav-screen-panel__glyph--settled' : 'nav-screen-panel__glyph'}>{style.glyph}</Text>
      <Text className={settled ? 'nav-screen-panel__label nav-screen-panel__label--settled' : 'nav-screen-panel__label'}>{item.label}</Text>
      {item.detail && <Text className="nav-screen-panel__detail">{item.detail}</Text>}
      {item.state && (
        <Text className={annotationStateClass(item.state, settled)}>
          {text(STATE_TEXT[item.state])}
        </Text>
      )}
    </Box>
  );
};

export { AnnotationRow };
