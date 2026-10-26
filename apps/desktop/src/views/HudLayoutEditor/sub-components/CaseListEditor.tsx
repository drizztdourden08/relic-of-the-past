/* @layer renderer-components @kind component */
import { Button, Flex, IconButton, Text } from '@drizztdourden08/tessera/primitives';
import { CaseBranch } from './CaseBranch';
import { ExpressionInput } from './ExpressionInput';
import { caseMatches, matchLabel } from '@app/hud-layout-editing/case-match';
import { useInstanceScopes } from '@app/hud-layout-editing/formula-scope';
import { placeholderChild } from '@app/hud-layout-editing/new-node';
import type { HudSwitchCase } from '@rotp/hud';
import type { CaseListEditorProps } from './CaseListEditor.type';

const move = <T,>(list: readonly T[], from: number, to: number): T[] => {
  const next = [...list];
  const moved = next.splice(from, 1);
  next.splice(to, 0, ...moved);
  return next;
};

const CaseListEditor = (props: CaseListEditorProps) => {
  const { spec, onChange, scope, insideRepeat, glyphPacks, selectedId, onSelectNode } = props;
  const { cases, otherwise } = spec;
  const instances = useInstanceScopes();

  const scopes = insideRepeat && instances.length > 0 ? instances : [scope];
  const matches = caseMatches(cases, scopes);

  const setCase = (i: number, patch: Partial<HudSwitchCase>): void => {
    onChange({ cases: cases.map((c, at) => (at === i ? { ...c, ...patch } : c)) });
  };

  return (
    <Flex direction="column" gap="2xs" className="hud-case-list">
      {cases.map((c, i) => {
        const live = matchLabel(matches.wins[i] ?? 0, matches.total);
        return (
          <Flex key={c.node.id} direction="column" gap="2xs" className={`hud-case-list__row${c.node.id === selectedId ? ' is-selected' : ''}${live ? ' is-live' : ''}`}>
            <Flex align="center" className="hud-case-list__head">
              <Text className="hud-inspect__sub">case {i + 1}</Text>
              {live && <Text className="hud-case-list__live">{live}</Text>}
              <Flex gap="2xs" className="hud-case-list__tools">
                <IconButton variant="ghost" size="sm" label="Move up" disabled={i === 0} onClick={() => onChange({ cases: move(cases, i, i - 1) })}>↑</IconButton>
                <IconButton variant="ghost" size="sm" label="Move down" disabled={i === cases.length - 1} onClick={() => onChange({ cases: move(cases, i, i + 1) })}>↓</IconButton>
                <IconButton variant="ghost" size="sm" label="Delete case" disabled={cases.length <= 1} onClick={() => onChange({ cases: cases.filter((_unused, at) => at !== i) })}>✕</IconButton>
              </Flex>
            </Flex>
            <ExpressionInput value={c.when} onChange={(when) => setCase(i, { when })} scope={scope} insideRepeat={insideRepeat} aria-label={`Case ${i + 1} condition`} />
            <CaseBranch node={c.node} label={`case ${i + 1}`} glyphPacks={glyphPacks} onSelectNode={onSelectNode} />
          </Flex>
        );
      })}

      <Button variant="ghost" size="sm" onClick={() => onChange({ cases: [...cases, { when: '1', node: placeholderChild() }] })}>
        + add case
      </Button>

      <Flex direction="column" gap="2xs" className={`hud-case-list__row hud-case-list__row--otherwise${otherwise?.id === selectedId ? ' is-selected' : ''}${matches.otherwise > 0 ? ' is-live' : ''}`}>
        <Flex align="center" className="hud-case-list__head">
          <Text className="hud-inspect__sub">otherwise</Text>
          {matchLabel(matches.otherwise, matches.total) !== null && (
            <Text className="hud-case-list__live">{matchLabel(matches.otherwise, matches.total)}</Text>
          )}
        </Flex>
        {otherwise ? (
          <>
            <CaseBranch node={otherwise} label="otherwise" glyphPacks={glyphPacks} onSelectNode={onSelectNode} />
            <Button variant="ghost" size="sm" onClick={() => onChange({ otherwise: undefined })}>remove</Button>
          </>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => onChange({ otherwise: placeholderChild() })}>+ add otherwise</Button>
        )}
      </Flex>
      <Text className="hud-editor__hint">First match wins, top to bottom.</Text>
    </Flex>
  );
};

export { CaseListEditor };
