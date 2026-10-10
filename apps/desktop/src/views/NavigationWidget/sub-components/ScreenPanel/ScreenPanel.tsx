/* @layer renderer-widgets @kind component */
import { useMemo } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { useNavigationOverlayStore } from '../../../../stores/navigation-overlay-store';
import { ANNOTATION_STYLES } from '../../../GameLayer/sub-components/navigation-overlay/annotation-style';
import { groupAnnotations } from './behavior/annotation-rows';
import { annotationStateClass } from './behavior/annotation-state-class';
import type { ScreenPanelProps } from './ScreenPanel.type';
import './ScreenPanel.css';

const ScreenPanel = ({ annotations }: ScreenPanelProps) => {
  const hiddenKinds = useNavigationOverlayStore((s) => s.hiddenKinds);
  const toggleKind = useNavigationOverlayStore((s) => s.toggleKind);
  const items = useMemo(() => annotations.flatMap((s) => s.items), [annotations]);
  const groups = useMemo(() => groupAnnotations(items), [items]);
  const tags = useMemo(() => annotations.flatMap((s) => s.tags ?? []), [annotations]);
  const checks = useMemo(() => annotations.reduce(
    (acc, s) => ({
      done: acc.done + s.checks.done,
      available: acc.available + s.checks.available,
      blocked: acc.blocked + s.checks.blocked,
    }),
    { done: 0, available: 0, blocked: 0 },
  ), [annotations]);

  if (annotations.length === 0) return null;
  const { done, available, blocked } = checks;

  return (
    <Box className="nav-section">
      <Box className="nav-section-title">On this screen</Box>

      {(done > 0 || available > 0 || blocked > 0) && (
        <Box className="nav-screen-panel__summary">
          <Text className="nav-screen-panel__done-count">{done} done</Text>
          <Text className="nav-screen-panel__avail-count">{available} available</Text>
          {blocked > 0 && <Text className="nav-screen-panel__blocked-count">{blocked} unreachable</Text>}
        </Box>
      )}

      {tags.length > 0 && (
        <Box className="nav-screen-panel__tag-row">
          {tags.map((tag, i) => (
            <Text key={`tag-${i}-${tag.value}`} title={`tag 0x${tag.value.toString(16)}`} className="nav-screen-panel__tag">
              {tag.name}
            </Text>
          ))}
        </Box>
      )}

      {groups.map((group) => (
        <Box key={group.id} className="nav-screen-panel__group">
          <Box className="nav-screen-panel__group-title">{group.title} ({group.items.length})</Box>
          {group.items.map((item, i) => {
            const style = ANNOTATION_STYLES[item.kind] ?? ANNOTATION_STYLES.unknown;
            const settled = item.state === 'open' || item.state === 'done';
            const off = hiddenKinds.has(item.kind);
            return (
              <Box
                key={`${group.id}-${i}-${item.kind}`}
                className={off ? 'nav-screen-panel__row nav-screen-panel__row--off' : 'nav-screen-panel__row'}
                onClick={() => toggleKind(item.kind)}
                title={`${item.kind} at r${item.tile.row} c${item.tile.col}${item.layer !== undefined ? ` L${item.layer}` : ''}. Click to ${off ? 'show' : 'hide'}`}
              >
                <Text style={{ color: style.color }} className={settled ? 'nav-screen-panel__glyph nav-screen-panel__glyph--settled' : 'nav-screen-panel__glyph'}>{style.glyph}</Text>
                <Text className={settled ? 'nav-screen-panel__label nav-screen-panel__label--settled' : 'nav-screen-panel__label'}>{item.label}</Text>
                {item.detail && <Text className="nav-screen-panel__detail">{item.detail}</Text>}
                {item.state && (
                  <Text className={annotationStateClass(item.state, settled)}>
                    {item.state === 'blocked' ? 'unreachable' : item.state}
                  </Text>
                )}
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};

export { ScreenPanel };
