/* @layer renderer-widgets @kind component */
import { useMemo } from 'react';
import type { ScreenAnnotations } from '@shared/game/simulation';
import { Box, Text } from '../../../../../design-system/primitives';
import { useNavigationOverlayStore } from '../../../../../../stores/navigation-overlay-store';
import { ANNOTATION_STYLES } from '../../../../app/views/GameLayer/sub-components/navigation-overlay/annotation-style';
import { S } from '../../styles';
import { PS } from './styles';
import { groupAnnotations, stepsOf } from './annotation-rows';
import { compareExitsToEdges } from './exit-parity';

interface EdgeLike {
  targetScreen: number;
  edge: string;
}

interface Props {
  annotations: readonly ScreenAnnotations[];
  edges: readonly EdgeLike[];
  isIndoors: boolean;
  /** Needed to name an indoor room, because room numbers collide across palaces/caves. */
  palaceIndex: number;
}

/**
 * "On this screen" lists every annotation the simulator derived, grouped the way the
 * overlay colours them, plus the decoded room tags and the exit/edge parity.
 *
 * This is the list side of the same ScreenAnnotations the canvas draws, so a
 * mechanic can never appear in one and be missing from the other.
 */
const ScreenPanel = ({ annotations, edges, isIndoors, palaceIndex }: Props) => {
  const hiddenKinds = useNavigationOverlayStore((s) => s.hiddenKinds);
  const toggleKind = useNavigationOverlayStore((s) => s.toggleKind);
  // A multi-screen area annotates every sub-screen; the panel is one list, so the
  // items merge and the tallies sum.
  const items = useMemo(() => annotations.flatMap((s) => s.items), [annotations]);
  const groups = useMemo(() => groupAnnotations(items), [items]);
  const parity = useMemo(
    () => compareExitsToEdges(items.filter((a) => a.kind === 'exit'), edges, isIndoors, palaceIndex),
    [items, edges, isIndoors, palaceIndex],
  );
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
          {[...group.items]
            .sort((a, b) => (group.id === 'ways-out' ? stepsOf(a) - stepsOf(b) : 0))
            .map((item, i) => {
              const style = ANNOTATION_STYLES[item.kind] ?? ANNOTATION_STYLES.unknown;
              const settled = item.state === 'open' || item.state === 'done';
              const off = hiddenKinds.has(item.kind);
              return (
                <Box
                  key={`${group.id}-${i}-${item.kind}`}
                  style={{ ...PS.row, ...PS.rowToggle, ...(off ? PS.rowOff : {}) }}
                  onClick={() => toggleKind(item.kind)}
                  title={`${item.kind} at r${item.tile.row} c${item.tile.col}${item.layer !== undefined ? ` L${item.layer}` : ''}. Click to ${off ? 'show' : 'hide'}`}
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

      {(parity.edgesWithoutExit.length > 0 || parity.exitsWithoutEdge.length > 0) && (
        <Box style={PS.group}>
          <Box style={PS.groupTitle}>Exit / edge parity</Box>
          {parity.edgesWithoutExit.map((t) => (
            <Box key={`no-exit-${t}`} style={PS.row}>
              <Text style={PS.warnGlyph}>!</Text>
              <Text style={PS.label}>{t}</Text>
              <Text style={PS.detail}>edge, no exit derived</Text>
            </Box>
          ))}
          {parity.exitsWithoutEdge.map((t) => (
            <Box key={`no-edge-${t}`} style={PS.row}>
              <Text style={PS.infoGlyph}>·</Text>
              <Text style={PS.label}>{t}</Text>
              <Text style={PS.detail}>exit via door / stair</Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export { ScreenPanel };
export type { Props as ScreenPanelProps };
