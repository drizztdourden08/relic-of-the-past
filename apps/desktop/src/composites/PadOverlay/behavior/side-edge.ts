/* @layer renderer-components @kind logic */
import type { Scene, SideEdge } from './placement.type';

const crossingsOf = (scene: Scene, top: number, bottom: number): number[] => {
  const xs: number[] = [];
  scene.edges.forEach(([a, b]) => {
    if (a.y >= top && a.y <= bottom) xs.push(a.x);
    for (const line of [top, bottom]) {
      if ((a.y - line) * (b.y - line) < 0) xs.push(a.x + ((line - a.y) / (b.y - a.y)) * (b.x - a.x));
    }
  });
  scene.circles.forEach((circle) => {
    if (circle.y + circle.r > top && circle.y - circle.r < bottom) xs.push(circle.x - circle.r, circle.x + circle.r);
  });
  return xs;
};

const sideEdge = (scene: Scene, top: number, bottom: number): SideEdge | null => {
  const key = `${Math.round(top)}|${Math.round(bottom)}`;
  const cached = scene.sideEdges.get(key);
  if (cached !== undefined) return cached;
  const xs = crossingsOf(scene, top, bottom);
  const edge = xs.length === 0 ? null : { left: Math.min(...xs), right: Math.max(...xs) };
  scene.sideEdges.set(key, edge);
  return edge;
};

export { sideEdge };
