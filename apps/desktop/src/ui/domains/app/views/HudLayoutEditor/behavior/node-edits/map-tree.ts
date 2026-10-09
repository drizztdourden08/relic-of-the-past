/* @layer renderer-components @kind logic */
import type { HudElementSpec, HudLayout, HudNode, HudSwitchCase } from '@rotp/hud';

const visitElementSpec = (spec: HudElementSpec, visit: (node: HudNode) => HudNode | null): HudElementSpec => {
  if (spec.type === 'repeat') {
    const child = visit(spec.child);
    return child ? { ...spec, child } : spec;
  }
  if (spec.type === 'switch') {
    const cases = spec.cases
      .map((c): HudSwitchCase | null => { const node = visit(c.node); return node ? { ...c, node } : null; })
      .filter((c): c is HudSwitchCase => c !== null);
    const otherwise = spec.otherwise ? (visit(spec.otherwise) ?? undefined) : undefined;
    return { ...spec, cases: cases.length > 0 ? cases : spec.cases, otherwise };
  }
  return spec;
};

const mapTree = (doc: HudLayout, map: (node: HudNode) => HudNode | null): HudLayout => {
  const visit = (node: HudNode): HudNode | null => {
    const mapped = map(node);
    if (!mapped) return null;
    if (mapped.kind === 'container') {
      const children = mapped.children.map(visit).filter((child): child is HudNode => child !== null);
      return { ...mapped, children };
    }
    return { ...mapped, element: visitElementSpec(mapped.element, visit) };
  };
  const screen = visit(doc.screen);
  return { ...doc, screen: screen && screen.kind === 'container' ? screen : doc.screen };
};

export { mapTree };
