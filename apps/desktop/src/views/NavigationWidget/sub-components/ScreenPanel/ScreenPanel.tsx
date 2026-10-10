/* @layer renderer-widgets @kind component */
import { useMemo } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { useNavigationOverlayStore } from '../../../../stores/navigation-overlay-store';
import { groupAnnotations } from './behavior/annotation-rows';
import { AnnotationRow } from './sub-components/AnnotationRow';
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
          {group.items.map((item, i) => (
            <AnnotationRow key={`${group.id}-${i}-${item.kind}`} item={item} tone={group.id} off={hiddenKinds.has(item.kind)} onToggle={toggleKind} />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export { ScreenPanel };
