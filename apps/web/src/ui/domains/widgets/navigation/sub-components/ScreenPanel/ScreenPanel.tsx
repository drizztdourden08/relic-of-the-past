/* @layer renderer-widgets @kind component */
import { useMemo } from 'react';
import type { ScreenAnnotations } from '@shared/game/simulation';
import { Box, Text } from '../../../../../design-system/primitives';
import { useNavigationOverlayStore } from '../../../../../../stores/navigation-overlay-store';
import { ANNOTATION_STYLES } from '../../../../app/views/GameLayer/sub-components/navigation-overlay/annotation-style';
import { S } from '../../styles';
import { PS } from './styles';
import { groupAnnotations } from './annotation-rows';

interface Props {
  annotations: readonly ScreenAnnotations[];
}

/**
 * "On this screen" — every annotation the simulator derived, grouped the way the
 * overlay colours them, plus the decoded room tags.
 *
 * This is the list side of the same ScreenAnnotations the canvas draws, so a
 * mechanic can never appear in one and be missing from the other. Ways on and off
 * the screen belong to the Connections panel, which reads crossings.
 */
const ScreenPanel = ({ annotations }: Props) => {
  const hiddenKinds = useNavigationOverlayStore((s) => s.hiddenKinds);
  const toggleKind = useNavigationOverlayStore((s) => s.toggleKind);
  // A multi-screen area annotates every sub-screen; the panel is one list, so the
  // items merge and the tallies sum.
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
    <Box style={S.section}>
      <Box style={S.sectionTitle}>On this screen</Box>

      {(done > 0 || available > 0 || blocked > 0) && (
        <Box style={PS.summary}>
          <Text style={PS.doneCount}>{done} done</Text>
          <Text style={PS.availCount}>{available} available</Text>
          {blocked > 0 && <Text style={PS.blockedCount}>{blocked} unreachable</Text>}
        </Box>
      )}

      {tags.length > 0 && (
        <Box style={PS.tagRow}>
          {tags.map((tag, i) => (
            <Text key={`tag-${i}-${tag.value}`} style={PS.tag} title={`tag 0x${tag.value.toString(16)}`}>
              {tag.name}
            </Text>
          ))}
        </Box>
      )}

      {groups.map((group) => (
        <Box key={group.id} style={PS.group}>
          <Box style={PS.groupTitle}>{group.title} ({group.items.length})</Box>
          {group.items.map((item, i) => {
            const style = ANNOTATION_STYLES[item.kind] ?? ANNOTATION_STYLES.unknown;
            const settled = item.state === 'open' || item.state === 'done';
            const off = hiddenKinds.has(item.kind);
            return (
              <Box
                key={`${group.id}-${i}-${item.kind}`}
                style={{ ...PS.row, ...PS.rowToggle, ...(off ? PS.rowOff : {}) }}
                onClick={() => toggleKind(item.kind)}
                title={`${item.kind} at r${item.tile.row} c${item.tile.col}${item.layer !== undefined ? ` L${item.layer}` : ''} — click to ${off ? 'show' : 'hide'}`}
              >
                <Text style={{ ...PS.glyph, color: style.color, opacity: settled ? 0.5 : 1 }}>{style.glyph}</Text>
                <Text style={{ ...PS.label, ...(settled ? PS.labelSettled : {}) }}>{item.label}</Text>
                {item.detail && <Text style={PS.detail}>{item.detail}</Text>}
                {item.state && (
                  <Text style={item.state === 'blocked' ? PS.stateBlocked : settled ? PS.stateSettled : PS.state}>
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
export type { Props as ScreenPanelProps };
