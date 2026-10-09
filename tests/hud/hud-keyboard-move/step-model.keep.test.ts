/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { stepIntent, stepOptions } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/behavior/step-intent';
import { announcementFor, ghostFor } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/behavior/drop-ghost';
import type { HudLayout } from '../../../shared/types/hud';
import { DOC } from './keyboard-move.constants';

describe('four directions, computed from the tree', () => {
  it('reorders among siblings', () => {
    expect(stepIntent(DOC, 'magic-bar', 'up')).toEqual({ kind: 'flex', parentId: 'hud', index: 0 });
    expect(stepIntent(DOC, 'hearts', 'down')).toEqual({ kind: 'flex', parentId: 'hud', index: 1 });
  });

  it('promotes OUT to the grandparent, immediately after the old parent', () => {
    expect(stepIntent(DOC, 'hearts', 'out')).toEqual({ kind: 'flex', parentId: 'screen', index: 1 });
  });

  it('demotes IN to the previous sibling, appended', () => {
    expect(stepIntent(DOC, 'loose', 'in')).toEqual({ kind: 'flex', parentId: 'vault', index: 1 });
  });

  it('answers null where there is NOWHERE to go, which gets the shake and no sentence', () => {
    const alreadyFirst = stepIntent(DOC, 'hearts', 'up');
    const alreadyLast = stepIntent(DOC, 'loose', 'down');
    const parentIsTheScreen = stepIntent(DOC, 'hud', 'out');
    const noPreviousSibling = stepIntent(DOC, 'hud', 'in');
    const firstChildHasNoPreviousSibling = stepIntent(DOC, 'pip1', 'in');
    const previousSiblingIsALeaf = stepIntent(DOC, 'pip2', 'in');
    const previousSiblingIsHud = stepIntent(DOC, 'vault', 'in');
    const rootHasNoArray = stepIntent(DOC, 'screen', 'down');
    expect(alreadyFirst).toBeNull();
    expect(alreadyLast).toBeNull();
    expect(parentIsTheScreen).toBeNull();
    expect(noPreviousSibling).toBeNull();
    expect(firstChildHasNoPreviousSibling).toBeNull();
    expect(previousSiblingIsALeaf).toBeNull();
    expect(previousSiblingIsHud).not.toBeNull();
    expect(rootHasNoArray).toBeNull();
  });

  it('is the SAME validity check the pointer runs, so it is a refusal and not a silent no-op', () => {
    expect(stepIntent(DOC, 'pip2', 'in')).toBeNull();
    const nested = { ...DOC, screen: { ...DOC.screen, children: [DOC.screen.children[0]] } } as HudLayout;
    const intent = stepIntent(nested, 'hearts', 'out');
    expect(intent).toMatchObject({ kind: 'flex', parentId: 'screen' });
  });
});

describe('THE ANNOUNCEMENT IS THE GHOST\'S OWN WORDS, flattened', () => {
  const say = (id: string, direction: 'up' | 'down' | 'out' | 'in'): { said: string; model: ReturnType<typeof ghostFor> } => {
    const intent = stepIntent(DOC, id, direction);
    if (!intent) throw new Error('no intent');
    const model = ghostFor(DOC, [id], intent);
    return { said: announcementFor(model), model };
  };

  it('carries every part of the card the card put there, and invents none', () => {
    const { said, model } = say('magic-bar', 'up');
    expect(said).toContain(model.chip);
    expect(said).toContain(model.kind);
    expect(said).toContain(model.position);
    expect(said).toBe(`${model.chip} moved ${model.kind}, ${model.position}`);
  });

  it('reads as a sentence, which is the plan\'s own check on the design', () => {
    expect(say('magic-bar', 'up').said).toBe('magic-bar moved into column, position 1 of 2');
    expect(say('loose', 'in').said).toBe('loose moved into row, position 2 of 2');
  });

  it('says what is wrong instead of that something is, when a drop is refused', () => {
    const model = ghostFor(DOC, ['hud'], {
      kind: 'refused', reason: 'descendant', parentId: 'hearts', nodeId: 'hearts',
    });
    expect(announcementFor(model)).toBe("can't move hud. hearts is already inside hud");
    expect(announcementFor(model)).toContain(model.position);
  });
});

describe('the menu names its own preconditions instead of hiding items', () => {
  it('offers all four, and dims the ones that cannot happen', () => {
    const options = stepOptions(DOC, 'hud');
    expect(options.map((o) => o.direction)).toEqual(['up', 'down', 'out', 'in']);
    expect(options.find((o) => o.direction === 'out')).toMatchObject({
      label: 'Move out of screen', enabled: false,
    });
    expect(options.find((o) => o.direction === 'in')).toMatchObject({ label: 'Move into...', enabled: false });
    expect(options.find((o) => o.direction === 'down')).toMatchObject({ enabled: true });
  });

  it('names the container an `in` would land in, once there is one', () => {
    expect(stepOptions(DOC, 'loose').find((o) => o.direction === 'in')).toMatchObject({
      label: 'Move into vault', enabled: true,
    });
  });
});
