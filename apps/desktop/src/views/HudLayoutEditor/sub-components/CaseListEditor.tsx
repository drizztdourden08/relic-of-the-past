/* @layer renderer-components @kind component */
import './HudLayoutEditor.content.css';
import { Button, Flex, IconButton, Text } from '@drizztdourden08/tessera/primitives';
import { ExpressionInput } from './ExpressionInput';
import { ReferenceField } from './ReferenceField';
import { caseMatches, matchLabel } from '@app/hud-layout-editing/case-match';
import { useInstanceScopes } from '@app/hud-layout-editing/formula-scope';
import { nodeArtOf } from '@app/hud-layout-editing/node-art';
import { placeholderChild } from '@app/hud-layout-editing/new-node';
import type { HudNode, HudSwitchCase } from '@rotp/hud';
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

  const branch = (node: HudNode, label: string) => {
    const art = nodeArtOf(node, glyphPacks);
    return (
      <ReferenceField
        compact
        action="go"
        src={art.src}
        placeholder={art.placeholder}
        name={art.name}
        kind={art.kind}
        onOpen={() => onSelectNode(node.id)}
        aria-label={`Go to ${label}: ${art.name}`}
      />
    );
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
            {branch(c.node, `case ${i + 1}`)}
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
            {branch(otherwise, 'otherwise')}
            <Button variant="ghost" size="sm" onClick={() => onChange({ otherwise: undefined })}>remove</Button>
          </>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => onChange({ otherwise: placeholderChild() })}>+ add otherwise</Button>
        )}
      </Flex>
      <Text className="hud-editor__hint">First match wins, top to bottom. The order is the logic, so reorder with ↑/↓.</Text>
    </Flex>
  );
};

export { CaseListEditor };
export type { CaseListEditorProps } from './CaseListEditor.type';
