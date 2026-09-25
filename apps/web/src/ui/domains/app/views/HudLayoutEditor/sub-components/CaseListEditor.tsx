/* @layer renderer-components @kind component */
/**
 * A `switch`'s cases. They reorder, because the ORDER IS THE LOGIC: first
 * match wins, top to bottom (`plans/hud-data-binding.html`'s wireframe 5).
 * Plus an `otherwise` row and "+ add case".
 *
 * A CASE'S OWN `node` IS A FULL SUBTREE, not a field this editor owns. This
 * only edits `when` and the case's place in the list. Its content (which
 * sprite, which text and so on) is tuned the same way any other node's is. Select
 * it in the outline, which lists it now (`node-edits.ts`'s own extension), and the
 * rest of the panel takes over. The button here jumps the selection there
 * directly, so a player never has to go hunting for the row it made.
 *
 * WHICH BRANCH IS WINNING IS DRAWN, NOT DEDUCED (phase 9). The order being the
 * logic is only useful if the reader can see the logic run, and until now they
 * could not: the panel printed `item >= 4`, the stage drew a half heart, and
 * joining those two facts was arithmetic done in the author's head against a
 * scope they had to remember. `behavior/case-match.ts` asks the ENGINE'S own
 * predicate, so the marker cannot disagree with what the stage drew. And
 * inside a repeat it reports a COUNT (`matches 6 of 20`) instead of picking
 * one instance and presenting it as the answer.
 *
 * AND THE CASE'S NODE IS A `ReferenceField`, on the same argument as every
 * other reference in this section: `sprite hud-silver-arrow-icon · sprite-3f21`
 * is a slug and an id where the editor owns the picture.
 */
import './HudLayoutEditor.content.css';
import { Button } from '@ds/primitives/Button';
import { Flex } from '@ds/primitives/Flex';
import { IconButton } from '@ds/primitives/IconButton';
import { Text } from '@ds/primitives/Text';
import { ExpressionInput } from './ExpressionInput';
import { ReferenceField } from './ReferenceField';
import { caseMatches, matchLabel } from '../behavior/case-match';
import { useInstanceScopes } from '../behavior/formula-scope';
import { nodeArtOf } from '../behavior/node-art';
import { placeholderChild } from '../behavior/new-node';
import type { GlyphPack, HudNode, HudSwitchCase, HudSwitchSpec } from '@shared/types/hud';

interface CaseListEditorProps {
  spec: HudSwitchSpec;
  onChange: (patch: Partial<HudSwitchSpec>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  glyphPacks: readonly GlyphPack[];
  selectedId: string | null;
  onSelectNode: (id: string) => void;
}

const move = <T,>(list: readonly T[], from: number, to: number): T[] => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

const CaseListEditor = (props: CaseListEditorProps) => {
  const { spec, onChange, scope, insideRepeat, glyphPacks, selectedId, onSelectNode } = props;
  const { cases, otherwise } = spec;
  const instances = useInstanceScopes();

  // Inside a repeat a switch is evaluated once per instance, so the previewed
  // data is the whole set of them; outside one it is the single data scope.
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
export type { CaseListEditorProps };
